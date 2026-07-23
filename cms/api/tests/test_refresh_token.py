import pytest

from app.core import refresh_token as rt
from tests.conftest import ADMIN_PREFIX, login_as

_REFRESH_PATH = f"{ADMIN_PREFIX}/autenticacion/refrescar"
_COOKIE_PATH = f"{ADMIN_PREFIX}/autenticacion"


class _FakeRedis:
    def __init__(self):
        self.kv: dict[str, str] = {}
        self.sets: dict[str, set] = {}
        self.ttls: dict[str, int] = {}

    def setex(self, key, ttl, value):
        self.kv[key] = value
        self.ttls[key] = ttl

    def get(self, key):
        return self.kv.get(key)

    def sadd(self, key, *members):
        self.sets.setdefault(key, set()).update(members)

    def smembers(self, key):
        return set(self.sets.get(key, set()))

    def srem(self, key, *members):
        s = self.sets.get(key)
        if s:
            s.difference_update(members)

    def expire(self, key, ttl):
        self.ttls[key] = ttl

    def delete(self, *keys):
        for k in keys:
            self.kv.pop(k, None)
            self.sets.pop(k, None)
            self.ttls.pop(k, None)


class _RaisingRedis:
    def __getattr__(self, name):
        def _boom(*args, **kwargs):
            raise ConnectionError("redis caido")

        return _boom


@pytest.fixture(autouse=True)
def fake_redis(monkeypatch):
    fake = _FakeRedis()
    monkeypatch.setattr(rt, "redis_client", fake)
    return fake


@pytest.fixture
def clock(monkeypatch):
    state = {"t": 1_000_000.0}
    monkeypatch.setattr(rt, "_now", lambda: state["t"])
    return state


def _tok_key(raw: str) -> str:
    return rt._TOK_KEY.format(rt._hash(raw))


def _family_of(fake: _FakeRedis, raw: str) -> str:
    import json

    return json.loads(fake.kv[_tok_key(raw)])["f"]


class TestRefreshTokenModule:
    def test_issue_crea_claves(self, fake_redis):
        raw = rt.issue_refresh_token("egar")

        assert raw is not None
        tok_key = _tok_key(raw)
        assert tok_key in fake_redis.kv
        family = _family_of(fake_redis, raw)
        assert rt._hash(raw) in fake_redis.sets[rt._FAM_KEY.format(family)]
        assert family in fake_redis.sets[rt._USER_KEY.format("egar")]
        assert fake_redis.ttls[tok_key] == 28800
        assert fake_redis.ttls[rt._FAM_KEY.format(family)] == 28800
        assert fake_redis.ttls[rt._USER_KEY.format("egar")] == 28800

    def test_rotate_feliz(self, fake_redis, clock):
        import json

        raw = rt.issue_refresh_token("egar")
        status, new_raw, username = rt.rotate_refresh_token(raw)

        assert status == rt.ROTATE_OK
        assert username == "egar"
        assert new_raw and new_raw != raw
        old = json.loads(fake_redis.kv[_tok_key(raw)])
        assert old["used"] is True
        assert old["used_at"] == clock["t"]
        assert _family_of(fake_redis, new_raw) == old["f"]
        fam_key = rt._FAM_KEY.format(old["f"])
        assert {rt._hash(raw), rt._hash(new_raw)} <= fake_redis.sets[fam_key]
        assert fake_redis.ttls[_tok_key(raw)] == 28800
        assert fake_redis.ttls[_tok_key(new_raw)] == 28800

    def test_rotate_token_inexistente(self):
        assert rt.rotate_refresh_token("no-existe") == (rt.ROTATE_INVALID, None, None)

    def test_reuso_dentro_de_gracia_no_revoca(self, fake_redis, clock):
        raw = rt.issue_refresh_token("egar")
        _, sucesor1, _ = rt.rotate_refresh_token(raw)

        clock["t"] += 10
        status, sucesor2, username = rt.rotate_refresh_token(raw)

        assert status == rt.ROTATE_OK
        assert username == "egar"
        assert sucesor2 and sucesor2 not in (raw, sucesor1)
        assert _family_of(fake_redis, sucesor2) == _family_of(fake_redis, sucesor1)
        status_s1, _, _ = rt.rotate_refresh_token(sucesor1)
        assert status_s1 == rt.ROTATE_OK

    def test_reuso_fuera_de_gracia_revoca_familia(self, fake_redis, clock):
        raw = rt.issue_refresh_token("egar")
        _, sucesor1, _ = rt.rotate_refresh_token(raw)
        family = _family_of(fake_redis, sucesor1)

        clock["t"] += 31
        status, new_raw, username = rt.rotate_refresh_token(raw)

        assert status == rt.ROTATE_REUSED
        assert new_raw is None
        assert username == "egar"
        assert _tok_key(raw) not in fake_redis.kv
        assert _tok_key(sucesor1) not in fake_redis.kv
        assert rt._FAM_KEY.format(family) not in fake_redis.sets
        assert family not in fake_redis.sets.get(rt._USER_KEY.format("egar"), set())
        assert rt.rotate_refresh_token(sucesor1) == (rt.ROTATE_INVALID, None, None)

    def test_revoke_token_revoca_familia_completa(self, fake_redis, clock):
        raw = rt.issue_refresh_token("egar")
        _, sucesor1, _ = rt.rotate_refresh_token(raw)
        clock["t"] += 10
        _, sucesor2, _ = rt.rotate_refresh_token(raw)

        rt.revoke_refresh_token(sucesor1)

        for tok in (raw, sucesor1, sucesor2):
            assert _tok_key(tok) not in fake_redis.kv

    def test_revoke_user_multiples_familias(self, fake_redis):
        raw_a = rt.issue_refresh_token("egar")
        raw_b = rt.issue_refresh_token("egar")

        rt.revoke_user_refresh_tokens("egar")

        assert _tok_key(raw_a) not in fake_redis.kv
        assert _tok_key(raw_b) not in fake_redis.kv
        assert rt._USER_KEY.format("egar") not in fake_redis.sets

    def test_revoke_user_con_familia_expirada(self, fake_redis):
        raw_a = rt.issue_refresh_token("egar")
        raw_b = rt.issue_refresh_token("egar")
        family_a = _family_of(fake_redis, raw_a)
        fake_redis.sets.pop(rt._FAM_KEY.format(family_a))

        rt.revoke_user_refresh_tokens("egar")

        assert _tok_key(raw_b) not in fake_redis.kv
        assert rt._USER_KEY.format("egar") not in fake_redis.sets

    def test_fail_open_redis_caido(self, monkeypatch):
        monkeypatch.setattr(rt, "redis_client", _RaisingRedis())

        assert rt.issue_refresh_token("egar") is None
        assert rt.rotate_refresh_token("x") == (rt.ROTATE_INVALID, None, None)
        rt.revoke_refresh_token("x")
        rt.revoke_user_refresh_tokens("egar")


def _refresh_set_cookies(response):
    return [h for h in response.headers.get_list("set-cookie") if h.startswith("refresh_token=")]


def _post_with_refresh(client, value):
    client.cookies.clear()
    return client.post(_REFRESH_PATH, headers={"Cookie": f"refresh_token={value}"})


class TestRefreshEndpoints:
    def test_login_setea_cookie_refresh(self, client, admin_user):
        response = client.post(
            f"{ADMIN_PREFIX}/autenticacion/iniciar-sesion",
            json={"username": "admin_test", "password": "testpass123"},
        )

        assert response.status_code == 200
        cookies = _refresh_set_cookies(response)
        assert len(cookies) == 1
        assert "HttpOnly" in cookies[0]
        assert f"Path={_COOKIE_PATH}" in cookies[0]
        assert "Max-Age=28800" in cookies[0]

    def test_logout_revoca_y_borra_cookie_refresh(self, client, admin_user):
        csrf = login_as(client, "admin_test", "testpass123")
        raw = client.cookies.get("refresh_token")

        response = client.post(
            f"{ADMIN_PREFIX}/autenticacion/cerrar-sesion",
            headers={"X-CSRF-Token": csrf},
        )

        assert response.status_code == 200
        cookies = _refresh_set_cookies(response)
        assert len(cookies) == 1
        assert 'Max-Age=0' in cookies[0] or "1970" in cookies[0]
        assert f"Path={_COOKIE_PATH}" in cookies[0]
        assert rt.rotate_refresh_token(raw) == (rt.ROTATE_INVALID, None, None)

    def test_refrescar_feliz(self, client, admin_user):
        login_as(client, "admin_test", "testpass123")
        old_refresh = client.cookies.get("refresh_token")

        response = client.post(_REFRESH_PATH)

        assert response.status_code == 200
        assert response.json()["csrf_token"]
        set_cookies = response.headers.get_list("set-cookie")
        assert any(h.startswith("access_token=") for h in set_cookies)
        refresh_cookies = _refresh_set_cookies(response)
        assert len(refresh_cookies) == 1
        assert f"Path={_COOKIE_PATH}" in refresh_cookies[0]
        assert client.cookies.get("refresh_token") != old_refresh

    def test_refrescar_sin_cookie_401(self, client):
        response = client.post(_REFRESH_PATH)

        assert response.status_code == 401

    def test_refrescar_reuso_fuera_de_gracia_revoca(self, client, admin_user, clock):
        login_as(client, "admin_test", "testpass123")
        old_refresh = client.cookies.get("refresh_token")

        assert client.post(_REFRESH_PATH).status_code == 200
        good_refresh = client.cookies.get("refresh_token")

        clock["t"] += 31
        response = _post_with_refresh(client, old_refresh)

        assert response.status_code == 401
        assert rt.rotate_refresh_token(good_refresh) == (rt.ROTATE_INVALID, None, None)

    def test_refrescar_tras_logout_401(self, client, admin_user):
        csrf = login_as(client, "admin_test", "testpass123")
        old_refresh = client.cookies.get("refresh_token")
        client.post(
            f"{ADMIN_PREFIX}/autenticacion/cerrar-sesion",
            headers={"X-CSRF-Token": csrf},
        )

        response = _post_with_refresh(client, old_refresh)

        assert response.status_code == 401

    def test_refrescar_usuario_borrado_401(self, client, admin_user, db_session):
        login_as(client, "admin_test", "testpass123")
        db_session.delete(admin_user)
        db_session.commit()

        response = client.post(_REFRESH_PATH)

        assert response.status_code == 401

    def test_cambiar_contrasena_invalida_refresh_viejos(self, client, admin_user):
        csrf = login_as(client, "admin_test", "testpass123")
        old_refresh = client.cookies.get("refresh_token")

        response = client.post(
            f"{ADMIN_PREFIX}/autenticacion/cambiar-contrasena",
            json={"current_password": "testpass123", "new_password": "NuevaPass123!"},
            headers={"X-CSRF-Token": csrf},
        )

        assert response.status_code == 200
        new_refresh = client.cookies.get("refresh_token")
        assert new_refresh and new_refresh != old_refresh
        assert rt.rotate_refresh_token(old_refresh) == (rt.ROTATE_INVALID, None, None)
        assert client.post(_REFRESH_PATH).status_code == 200
