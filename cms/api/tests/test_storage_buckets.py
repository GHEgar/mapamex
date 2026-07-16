from app.models.storage_bucket import StorageBucket
from app.models.project import Project, UserProject
from tests.conftest import ADMIN_PREFIX


def _seed_buckets(db_session):
    portal = Project(slug="portal", name="Portal", is_active=True)
    visor = Project(slug="visor", name="Visor", is_active=True)
    db_session.add_all([portal, visor])
    db_session.commit()
    db_session.refresh(portal)
    db_session.refresh(visor)

    portal_bucket = StorageBucket(
        project_id=portal.id,
        storage_bucket="portal-bucket",
        access_key_ref="portal-key",
        display_name="Portal Bucket",
    )
    visor_bucket = StorageBucket(
        project_id=visor.id,
        storage_bucket="visor-bucket",
        access_key_ref="visor-key",
        display_name="Visor Bucket",
    )
    inactivo = StorageBucket(
        project_id=portal.id,
        storage_bucket="inactivo-bucket",
        access_key_ref="inactivo-key",
        display_name="Inactivo",
        is_active=False,
    )
    db_session.add_all([portal_bucket, visor_bucket, inactivo])
    db_session.commit()
    db_session.refresh(portal_bucket)
    db_session.refresh(visor_bucket)
    return portal, visor, portal_bucket, visor_bucket


def test_list_buckets_requires_auth(client):
    response = client.get(f"{ADMIN_PREFIX}/storage-buckets")
    assert response.status_code == 401


def test_list_buckets_admin_sees_all_active(admin_session, db_session):
    _seed_buckets(db_session)
    client = admin_session["client"]
    response = client.get(f"{ADMIN_PREFIX}/storage-buckets")
    assert response.status_code == 200
    names = sorted([b["storage_bucket"] for b in response.json()])
    assert names == ["portal-bucket", "visor-bucket"]


def test_list_buckets_editora_filtered_by_membership(
    editora_session, db_session, editora_user
):
    portal, _, _, _ = _seed_buckets(db_session)
    db_session.add(
        UserProject(user_id=editora_user.id, project_id=portal.id, project_role="editor")
    )
    db_session.commit()

    client = editora_session["client"]
    response = client.get(f"{ADMIN_PREFIX}/storage-buckets")
    assert response.status_code == 200
    names = [b["storage_bucket"] for b in response.json()]
    assert names == ["portal-bucket"]


def test_list_buckets_editora_without_membership_empty(editora_session, db_session):
    _seed_buckets(db_session)
    client = editora_session["client"]
    response = client.get(f"{ADMIN_PREFIX}/storage-buckets")
    assert response.status_code == 200
    assert response.json() == []


def test_create_bucket_admin_ok(admin_session, db_session):
    portal, _, _, _ = _seed_buckets(db_session)
    client = admin_session["client"]
    response = client.post(
        f"{ADMIN_PREFIX}/storage-buckets",
        json={
            "project_id": portal.id,
            "storage_bucket": "nuevo-bucket",
            "access_key_ref": "nuevo-key",
            "display_name": "Nuevo Bucket",
        },
        headers={"X-CSRF-Token": admin_session["csrf"]},
    )
    assert response.status_code == 201
    assert response.json()["storage_bucket"] == "nuevo-bucket"


def test_create_bucket_editora_forbidden(editora_session, db_session):
    portal, _, _, _ = _seed_buckets(db_session)
    client = editora_session["client"]
    response = client.post(
        f"{ADMIN_PREFIX}/storage-buckets",
        json={
            "project_id": portal.id,
            "storage_bucket": "hack-bucket",
            "access_key_ref": "hack-key",
            "display_name": "Hack",
        },
        headers={"X-CSRF-Token": editora_session["csrf"]},
    )
    assert response.status_code == 403


def test_create_bucket_invalid_project(admin_session):
    client = admin_session["client"]
    response = client.post(
        f"{ADMIN_PREFIX}/storage-buckets",
        json={
            "project_id": 9999,
            "storage_bucket": "nuevo-bucket",
            "access_key_ref": "nuevo-key",
            "display_name": "Nuevo",
        },
        headers={"X-CSRF-Token": admin_session["csrf"]},
    )
    assert response.status_code == 400


def test_update_bucket_admin_ok(admin_session, db_session):
    _, _, portal_bucket, _ = _seed_buckets(db_session)
    client = admin_session["client"]
    response = client.patch(
        f"{ADMIN_PREFIX}/storage-buckets/{portal_bucket.id}",
        json={"display_name": "Renombrado"},
        headers={"X-CSRF-Token": admin_session["csrf"]},
    )
    assert response.status_code == 200
    assert response.json()["display_name"] == "Renombrado"


def test_update_bucket_editora_forbidden(editora_session, db_session):
    _, _, portal_bucket, _ = _seed_buckets(db_session)
    client = editora_session["client"]
    response = client.patch(
        f"{ADMIN_PREFIX}/storage-buckets/{portal_bucket.id}",
        json={"display_name": "Hack"},
        headers={"X-CSRF-Token": editora_session["csrf"]},
    )
    assert response.status_code == 403
