import uuid

from tests.conftest import create_project


class TestProfile:
    def test_get_profile(self, client, auth_headers):
        response = client.get("/api/v1/profile", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["display_name"] is None
        assert "avatar_url" in data

    def test_update_profile(self, client, auth_headers):
        response = client.put(
            "/api/v1/profile",
            headers=auth_headers,
            json={
                "display_name": "Dmitriy K.",
                "headline": "Python & Full-Stack Developer",
                "bio": "I build automation tools.",
                "location": "Moscow",
                "github_url": "https://github.com/example",
                "telegram_url": "https://t.me/example",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["display_name"] == "Dmitriy K."
        assert data["headline"] == "Python & Full-Stack Developer"
        assert data["github_url"] == "https://github.com/example"

    def test_profile_isolated_between_users(self, client, auth_headers, second_user_headers):
        client.put(
            "/api/v1/profile",
            headers=auth_headers,
            json={"display_name": "Owner Name"},
        )
        response = client.get("/api/v1/profile", headers=second_user_headers)
        assert response.json()["display_name"] is None

    def test_profile_requires_auth(self, client):
        assert client.get("/api/v1/profile").status_code == 401

    def test_invalid_url_rejected(self, client, auth_headers):
        response = client.put(
            "/api/v1/profile",
            headers=auth_headers,
            json={"github_url": "not-a-url"},
        )
        assert response.status_code == 422

    def test_partial_update_keeps_other_fields(self, client, auth_headers):
        client.put(
            "/api/v1/profile",
            headers=auth_headers,
            json={"display_name": "Original", "headline": "Dev"},
        )
        response = client.put(
            "/api/v1/profile",
            headers=auth_headers,
            json={"location": "Moscow"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["display_name"] == "Original"
        assert data["headline"] == "Dev"
        assert data["location"] == "Moscow"
