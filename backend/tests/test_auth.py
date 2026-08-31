import uuid


class TestRegister:
    def test_register_success(self, client):
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "a@example.com", "username": "usera", "password": "strongpass123"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["access_token"]
        assert data["user"]["email"] == "a@example.com"
        assert data["user"]["username"] == "usera"
        assert "password" not in data["user"]

    def test_register_duplicate_email(self, client):
        payload = {"email": "dup@example.com", "username": "user1", "password": "strongpass123"}
        client.post("/api/v1/auth/register", json=payload)
        payload["username"] = "user2"
        response = client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 409
        assert response.json()["error"]["code"] == "EMAIL_ALREADY_EXISTS"

    def test_register_duplicate_username(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"email": "one@example.com", "username": "same", "password": "strongpass123"},
        )
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "two@example.com", "username": "same", "password": "strongpass123"},
        )
        assert response.status_code == 409
        assert response.json()["error"]["code"] == "USERNAME_ALREADY_EXISTS"

    def test_register_invalid_username(self, client):
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "x@example.com", "username": "Bad Username", "password": "strongpass123"},
        )
        assert response.status_code == 422

    def test_register_reserved_username(self, client):
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "x@example.com", "username": "admin", "password": "strongpass123"},
        )
        assert response.status_code == 422

    def test_register_short_password(self, client):
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "x@example.com", "username": "userx", "password": "short"},
        )
        assert response.status_code == 422

    def test_register_creates_profile(self, client, auth_headers):
        response = client.get("/api/v1/profile", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["display_name"] is None


class TestLogin:
    def test_login_success(self, client, auth_headers):
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "owner@example.com", "password": "strongpass123"},
        )
        assert response.status_code == 200
        assert response.json()["access_token"]

    def test_login_wrong_password(self, client, auth_headers):
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "owner@example.com", "password": "wrongpassword"},
        )
        assert response.status_code == 401
        assert response.json()["error"]["code"] == "INVALID_CREDENTIALS"

    def test_login_unknown_email(self, client):
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "ghost@example.com", "password": "whatever123"},
        )
        assert response.status_code == 401

    def test_me_requires_auth(self, client):
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_me_with_token(self, client, auth_headers):
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["username"] == "owner"

    def test_me_with_invalid_token(self, client):
        response = client.get(
            "/api/v1/auth/me", headers={"Authorization": f"Bearer {uuid.uuid4().hex}"}
        )
        assert response.status_code == 401
