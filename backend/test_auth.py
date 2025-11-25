"""
Unit tests for authentication endpoints
Tests for MTP 5: Auth Backend (FastAPI) - DB-ready
"""
import pytest
from fastapi.testclient import TestClient
import sqlite3
import os
import sys

# Setup test database before importing app
TEST_DB = "test_medicure.db"

# Monkey-patch DB_PATH before importing
import auth
auth.DB_PATH = TEST_DB

from main import app
from auth import get_password_hash, verify_password, init_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_test_db():
    """Setup test database before each test"""
    # Remove existing test database
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)

    # Initialize test database
    init_db(TEST_DB)

    yield

    # Cleanup
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)


class TestPasswordHashing:
    """Test argon2 password hashing"""

    def test_password_hash_generation(self):
        """Test that password hashing generates argon2 hash"""
        password = "test_password_123"
        hashed = get_password_hash(password)

        # Argon2 hashes start with $argon2
        assert hashed.startswith("$argon2")
        assert hashed != password

    def test_password_verification_success(self):
        """Test successful password verification"""
        password = "secure_password"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True

    def test_password_verification_failure(self):
        """Test failed password verification"""
        password = "correct_password"
        wrong_password = "wrong_password"
        hashed = get_password_hash(password)

        assert verify_password(wrong_password, hashed) is False

    def test_no_plaintext_storage(self):
        """Test that plaintext passwords are never stored"""
        password = "my_secret_password"
        hashed = get_password_hash(password)

        # Ensure hash doesn't contain plaintext
        assert password not in hashed


class TestAuthRegistration:
    """Test user registration endpoint"""

    def test_register_new_user(self):
        """Test successful user registration"""
        response = client.post(
            "/auth/signup",
            json={
                "name": "Test Patient",
                "email": "patient@test.com",
                "password": "secure_password",
                "role": "patient"
            }
        )

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "role" in data
        assert data["role"] == "patient"
        assert "user_id" in data

    def test_register_duplicate_email(self):
        """Test registration with duplicate email fails"""
        user_data = {
            "name": "Test User",
            "email": "duplicate@test.com",
            "password": "password123",
            "role": "patient"
        }

        # First registration
        response1 = client.post("/auth/signup", json=user_data)
        assert response1.status_code == 200

        # Duplicate registration
        response2 = client.post("/auth/signup", json=user_data)
        assert response2.status_code == 400
        assert "already registered" in response2.json()["detail"].lower()

    def test_register_invalid_role(self):
        """Test registration with invalid role fails"""
        response = client.post(
            "/auth/signup",
            json={
                "name": "Test User",
                "email": "invalid@test.com",
                "password": "password123",
                "role": "invalid_role"
            }
        )

        assert response.status_code == 400
        assert "Invalid role" in response.json()["detail"]

    def test_register_all_valid_roles(self):
        """Test registration with all valid roles"""
        valid_roles = ["patient", "doctor", "caregiver", "super_admin"]

        for idx, role in enumerate(valid_roles):
            response = client.post(
                "/auth/signup",
                json={
                    "name": f"Test {role}",
                    "email": f"{role}{idx}@test.com",
                    "password": "password123",
                    "role": role
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert data["role"] == role


class TestAuthLogin:
    """Test user login endpoint"""

    def test_login_success(self):
        """Test successful login"""
        # Register user first
        client.post(
            "/auth/signup",
            json={
                "name": "Login Test",
                "email": "login@test.com",
                "password": "test_password",
                "role": "patient"
            }
        )

        # Login
        response = client.post(
            "/auth/login",
            json={
                "email": "login@test.com",
                "password": "test_password"
            }
        )

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "role" in data
        assert data["role"] == "patient"
        assert "user_id" in data

    def test_login_wrong_password(self):
        """Test login with wrong password fails"""
        # Register user
        client.post(
            "/auth/signup",
            json={
                "name": "Wrong Password Test",
                "email": "wrong@test.com",
                "password": "correct_password",
                "role": "patient"
            }
        )

        # Login with wrong password
        response = client.post(
            "/auth/login",
            json={
                "email": "wrong@test.com",
                "password": "wrong_password"
            }
        )

        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_nonexistent_user(self):
        """Test login with nonexistent email fails"""
        response = client.post(
            "/auth/login",
            json={
                "email": "nonexistent@test.com",
                "password": "password123"
            }
        )

        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]


class TestJWTRoleClaims:
    """Test JWT token includes role claims"""

    def test_jwt_contains_role(self):
        """Test that JWT token contains role claim"""
        from jose import jwt
        from auth import SECRET_KEY, ALGORITHM

        # Register user
        response = client.post(
            "/auth/signup",
            json={
                "name": "JWT Test",
                "email": "jwt@test.com",
                "password": "password123",
                "role": "doctor"
            }
        )

        assert response.status_code == 200
        token = response.json()["access_token"]

        # Decode token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Verify role claim
        assert "role" in payload
        assert payload["role"] == "doctor"

    def test_jwt_contains_user_id(self):
        """Test that JWT token contains user_id claim"""
        from jose import jwt
        from auth import SECRET_KEY, ALGORITHM

        # Register user
        response = client.post(
            "/auth/signup",
            json={
                "name": "User ID Test",
                "email": "userid@test.com",
                "password": "password123",
                "role": "patient"
            }
        )

        assert response.status_code == 200
        data = response.json()
        token = data["access_token"]
        user_id = data["user_id"]

        # Decode token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Verify user_id claim
        assert "user_id" in payload
        assert payload["user_id"] == user_id


class TestHealthEndpoint:
    """Test health check endpoint"""

    def test_health_check(self):
        """Test health endpoint returns success"""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
