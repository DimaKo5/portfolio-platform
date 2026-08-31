import uuid

from tests.conftest import create_project


class TestProjectCRUD:
    def test_create_project(self, client, auth_headers):
        data = create_project(client, auth_headers, title="Telegram CRM", problem="Manual work", solution="Built a CRM")
        assert data["title"] == "Telegram CRM"
        assert data["slug"] == "telegram-crm"
        assert data["status"] == "DRAFT"
        assert data["problem"] == "Manual work"
        assert data["technologies"] == []

    def test_create_project_requires_auth(self, client):
        response = client.post("/api/v1/projects", json={"title": "X"})
        assert response.status_code == 401

    def test_get_project_by_owner(self, client, auth_headers):
        created = create_project(client, auth_headers)
        response = client.get(f"/api/v1/projects/{created['id']}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["id"] == created["id"]

    def test_get_project_of_other_user_denied(self, client, auth_headers, second_user_headers):
        created = create_project(client, auth_headers)
        response = client.get(f"/api/v1/projects/{created['id']}", headers=second_user_headers)
        assert response.status_code == 404
        assert response.json()["error"]["code"] == "PROJECT_NOT_FOUND"

    def test_get_missing_project_404(self, client, auth_headers):
        response = client.get(f"/api/v1/projects/{uuid.uuid4()}", headers=auth_headers)
        assert response.status_code == 404

    def test_update_project(self, client, auth_headers):
        created = create_project(client, auth_headers)
        response = client.put(
            f"/api/v1/projects/{created['id']}",
            headers=auth_headers,
            json={"title": "Updated Title", "result": "Saved 10 hours weekly"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["result"] == "Saved 10 hours weekly"
        assert data["short_description"] == "CRM system."

    def test_partial_update_without_title(self, client, auth_headers):
        created = create_project(client, auth_headers)
        response = client.put(
            f"/api/v1/projects/{created['id']}",
            headers=auth_headers,
            json={"cover_image_url": "/uploads/x.png"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Telegram CRM"
        assert data["slug"] == "telegram-crm"
        assert data["cover_image_url"] == "/uploads/x.png"

    def test_update_project_by_other_user_denied(self, client, auth_headers, second_user_headers):
        created = create_project(client, auth_headers)
        response = client.put(
            f"/api/v1/projects/{created['id']}",
            headers=second_user_headers,
            json={"title": "Hacked"},
        )
        assert response.status_code == 404

    def test_delete_project(self, client, auth_headers):
        created = create_project(client, auth_headers)
        response = client.delete(f"/api/v1/projects/{created['id']}", headers=auth_headers)
        assert response.status_code == 204
        response = client.get(f"/api/v1/projects/{created['id']}", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_project_by_other_user_denied(self, client, auth_headers, second_user_headers):
        created = create_project(client, auth_headers)
        response = client.delete(f"/api/v1/projects/{created['id']}", headers=second_user_headers)
        assert response.status_code == 404

    def test_list_projects_only_own(self, client, auth_headers, second_user_headers):
        create_project(client, auth_headers, title="My Project A")
        create_project(client, second_user_headers, title="Other Project B")
        response = client.get("/api/v1/projects", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["title"] == "My Project A"


class TestSlug:
    def test_slug_cyrillic_title(self, client, auth_headers):
        data = create_project(client, auth_headers, title="Телеграм CRM")
        assert data["slug"] == "telegram-crm"

    def test_slug_unique_per_user(self, client, auth_headers):
        first = create_project(client, auth_headers, title="Telegram CRM")
        second = create_project(client, auth_headers, title="Telegram CRM")
        assert first["slug"] == "telegram-crm"
        assert second["slug"] == "telegram-crm-2"

    def test_same_slug_allowed_for_different_users(self, client, auth_headers, second_user_headers):
        first = create_project(client, auth_headers, title="My App")
        second = create_project(client, second_user_headers, title="My App")
        assert first["slug"] == second["slug"] == "my-app"

    def test_title_change_regenerates_slug(self, client, auth_headers):
        created = create_project(client, auth_headers, title="Old Name")
        response = client.put(
            f"/api/v1/projects/{created['id']}",
            headers=auth_headers,
            json={"title": "New Name"},
        )
        assert response.json()["slug"] == "new-name"


class TestPublishing:
    def test_publish(self, client, auth_headers):
        created = create_project(client, auth_headers)
        response = client.post(f"/api/v1/projects/{created['id']}/publish", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "PUBLISHED"
        assert data["published_at"] is not None

    def test_unpublish(self, client, auth_headers):
        created = create_project(client, auth_headers)
        client.post(f"/api/v1/projects/{created['id']}/publish", headers=auth_headers)
        response = client.post(f"/api/v1/projects/{created['id']}/unpublish", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "DRAFT"

    def test_publish_by_other_user_denied(self, client, auth_headers, second_user_headers):
        created = create_project(client, auth_headers)
        response = client.post(f"/api/v1/projects/{created['id']}/publish", headers=second_user_headers)
        assert response.status_code == 404


class TestReorder:
    def test_reorder(self, client, auth_headers):
        a = create_project(client, auth_headers, title="Project A")
        b = create_project(client, auth_headers, title="Project B")
        c = create_project(client, auth_headers, title="Project C")
        response = client.put(
            "/api/v1/projects/reorder",
            headers=auth_headers,
            json={"project_ids": [c["id"], a["id"], b["id"]]},
        )
        assert response.status_code == 204
        listing = client.get("/api/v1/projects", headers=auth_headers).json()
        titles = [p["title"] for p in listing["items"]]
        assert titles == ["Project C", "Project A", "Project B"]

    def test_reorder_with_foreign_id_rejected(self, client, auth_headers, second_user_headers):
        foreign = create_project(client, second_user_headers, title="Foreign")
        response = client.put(
            "/api/v1/projects/reorder",
            headers=auth_headers,
            json={"project_ids": [foreign["id"]]},
        )
        assert response.status_code == 400

    def test_reorder_route_not_swallowed_by_id_param(self, client, auth_headers):
        create_project(client, auth_headers, title="Some Project")
        response = client.put(
            "/api/v1/projects/reorder",
            headers=auth_headers,
            json={"project_ids": []},
        )
        # Empty list -> validation error 422, NOT a 404 "project reorder not found"
        assert response.status_code == 422


class TestTechnologies:
    def test_list_technologies(self, client):
        response = client.get("/api/v1/technologies")
        assert response.status_code == 200
        techs = response.json()
        names = [t["name"] for t in techs]
        assert "Python" in names
        assert "React" in names
        assert all({"id", "name", "slug"} <= set(t) for t in techs)

    def test_set_project_technologies(self, client, auth_headers):
        created = create_project(client, auth_headers)
        techs = client.get("/api/v1/technologies").json()
        python_id = next(t["id"] for t in techs if t["name"] == "Python")
        react_id = next(t["id"] for t in techs if t["name"] == "React")
        response = client.put(
            f"/api/v1/projects/{created['id']}/technologies",
            headers=auth_headers,
            json={"technology_ids": [python_id, react_id]},
        )
        assert response.status_code == 200
        names = {t["name"] for t in response.json()["technologies"]}
        assert names == {"Python", "React"}

    def test_set_technologies_replaces_list(self, client, auth_headers):
        created = create_project(client, auth_headers)
        techs = client.get("/api/v1/technologies").json()
        python_id = next(t["id"] for t in techs if t["name"] == "Python")
        docker_id = next(t["id"] for t in techs if t["name"] == "Docker")
        client.put(
            f"/api/v1/projects/{created['id']}/technologies",
            headers=auth_headers,
            json={"technology_ids": [python_id]},
        )
        response = client.put(
            f"/api/v1/projects/{created['id']}/technologies",
            headers=auth_headers,
            json={"technology_ids": [docker_id]},
        )
        names = {t["name"] for t in response.json()["technologies"]}
        assert names == {"Docker"}

    def test_set_technologies_unknown_id(self, client, auth_headers):
        created = create_project(client, auth_headers)
        response = client.put(
            f"/api/v1/projects/{created['id']}/technologies",
            headers=auth_headers,
            json={"technology_ids": [str(uuid.uuid4())]},
        )
        assert response.status_code == 400

    def test_set_technologies_by_other_user_denied(self, client, auth_headers, second_user_headers):
        created = create_project(client, auth_headers)
        techs = client.get("/api/v1/technologies").json()
        response = client.put(
            f"/api/v1/projects/{created['id']}/technologies",
            headers=second_user_headers,
            json={"technology_ids": [techs[0]["id"]]},
        )
        assert response.status_code == 404
