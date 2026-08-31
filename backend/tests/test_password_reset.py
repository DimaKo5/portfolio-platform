class TestPasswordReset:
    def test_request_unknown_email_generic_response(self, client):
        response = client.post(
            "/api/v1/auth/reset-request", json={"email": "ghost@example.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "dev_code" not in data or data["dev_code"] is None

    def test_request_returns_dev_code_in_development(self, client, auth_headers):
        response = client.post(
            "/api/v1/auth/reset-request", json={"email": "owner@example.com"}
        )
        assert response.status_code == 200
        code = response.json()["dev_code"]
        assert code and len(code) == 6 and code.isdigit()

    def test_invalid_code_format(self, client, auth_headers):
        client.post("/api/v1/auth/reset-request", json={"email": "owner@example.com"})
        response = client.post(
            "/api/v1/auth/reset-confirm",
            json={"email": "owner@example.com", "code": "12", "new_password": "freshpass123"},
        )
        assert response.status_code == 422

    def test_wrong_code_rejected(self, client, auth_headers):
        client.post("/api/v1/auth/reset-request", json={"email": "owner@example.com"})
        response = client.post(
            "/api/v1/auth/reset-confirm",
            json={"email": "owner@example.com", "code": "000000", "new_password": "freshpass123"},
        )
        assert response.status_code == 400
        assert response.json()["error"]["code"] == "INVALID_RESET_CODE"

    def test_reset_flow_changes_password(self, client, auth_headers):
        response = client.post(
            "/api/v1/auth/reset-request", json={"email": "owner@example.com"}
        )
        code = response.json()["dev_code"]
        response = client.post(
            "/api/v1/auth/reset-confirm",
            json={"email": "owner@example.com", "code": code, "new_password": "freshpass123"},
        )
        assert response.status_code == 204

        old = client.post(
            "/api/v1/auth/login",
            json={"email": "owner@example.com", "password": "strongpass123"},
        )
        assert old.status_code == 401
        new = client.post(
            "/api/v1/auth/login",
            json={"email": "owner@example.com", "password": "freshpass123"},
        )
        assert new.status_code == 200

    def test_code_single_use(self, client, auth_headers):
        response = client.post(
            "/api/v1/auth/reset-request", json={"email": "owner@example.com"}
        )
        code = response.json()["dev_code"]
        client.post(
            "/api/v1/auth/reset-confirm",
            json={"email": "owner@example.com", "code": code, "new_password": "freshpass123"},
        )
        second = client.post(
            "/api/v1/auth/reset-confirm",
            json={"email": "owner@example.com", "code": code, "new_password": "anotherpass1"},
        )
        assert second.status_code == 400

    def test_new_request_invalidates_old_code(self, client, auth_headers):
        first = client.post(
            "/api/v1/auth/reset-request", json={"email": "owner@example.com"}
        ).json()["dev_code"]
        second = client.post(
            "/api/v1/auth/reset-request", json={"email": "owner@example.com"}
        ).json()["dev_code"]
        assert first != second

        old = client.post(
            "/api/v1/auth/reset-confirm",
            json={"email": "owner@example.com", "code": first, "new_password": "freshpass123"},
        )
        assert old.status_code == 400
        ok = client.post(
            "/api/v1/auth/reset-confirm",
            json={"email": "owner@example.com", "code": second, "new_password": "freshpass123"},
        )
        assert ok.status_code == 204

    def test_reset_request_rate_limited(self, client, auth_headers):
        for _ in range(3):
            client.post("/api/v1/auth/reset-request", json={"email": "owner@example.com"})
        response = client.post(
            "/api/v1/auth/reset-request", json={"email": "owner@example.com"}
        )
        assert response.status_code == 429
