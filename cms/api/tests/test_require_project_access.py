from app.models.project import Project, UserProject
from tests.conftest import ADMIN_PREFIX


def _seed_visor(db_session):
    visor = Project(slug="visor", name="Visor", is_active=True)
    db_session.add(visor)
    db_session.commit()
    db_session.refresh(visor)
    return visor


def test_editora_sin_membership_403_en_read(editora_session, db_session):
    _seed_visor(db_session)
    client = editora_session["client"]
    response = client.get(f"{ADMIN_PREFIX}/home")
    assert response.status_code == 403


def test_admin_global_bypassa_membership(admin_session, db_session):
    _seed_visor(db_session)
    client = admin_session["client"]
    response = client.get(f"{ADMIN_PREFIX}/home")
    assert response.status_code == 200


def test_editora_viewer_puede_leer(editora_session, db_session, editora_user):
    visor = _seed_visor(db_session)
    db_session.add(
        UserProject(user_id=editora_user.id, project_id=visor.id, project_role="viewer")
    )
    db_session.commit()

    client = editora_session["client"]
    response = client.get(f"{ADMIN_PREFIX}/home")
    assert response.status_code == 200


def test_editora_viewer_no_puede_escribir(editora_session, db_session, editora_user):
    visor = _seed_visor(db_session)
    db_session.add(
        UserProject(user_id=editora_user.id, project_id=visor.id, project_role="viewer")
    )
    db_session.commit()

    client = editora_session["client"]
    response = client.put(
        f"{ADMIN_PREFIX}/home/banner",
        json={},
        headers={"X-CSRF-Token": editora_session["csrf"]},
    )
    assert response.status_code == 403
    assert "editor" in response.json()["detail"].lower()


def test_editora_editor_puede_escribir(editora_session, db_session, editora_user):
    visor = _seed_visor(db_session)
    db_session.add(
        UserProject(user_id=editora_user.id, project_id=visor.id, project_role="editor")
    )
    db_session.commit()

    client = editora_session["client"]
    response = client.put(
        f"{ADMIN_PREFIX}/home/banner",
        json={},
        headers={"X-CSRF-Token": editora_session["csrf"]},
    )
    assert response.status_code != 403


def test_proyecto_inexistente_404(editora_session, db_session):
    client = editora_session["client"]
    response = client.get(f"{ADMIN_PREFIX}/home")
    assert response.status_code == 404
