from app.utils.slug import is_valid_username, slugify, unique_slug


class TestSlugify:
    def test_english(self):
        assert slugify("Telegram CRM") == "telegram-crm"

    def test_cyrillic(self):
        assert slugify("Телеграм CRM") == "telegram-crm"

    def test_special_chars(self):
        assert slugify("My App: v2.0!") == "my-app-v20"

    def test_empty(self):
        assert slugify("!!!") == ""

    def test_multiple_spaces(self):
        assert slugify("a   b\tc") == "a-b-c"


class TestUniqueSlug:
    def test_no_conflict(self):
        assert unique_slug("app", set()) == "app"

    def test_conflict(self):
        assert unique_slug("app", {"app"}) == "app-2"

    def test_multiple_conflicts(self):
        assert unique_slug("app", {"app", "app-2", "app-3"}) == "app-4"

    def test_empty_base(self):
        assert unique_slug("", set()) == "project"


class TestUsernameValidation:
    def test_valid(self):
        assert is_valid_username("dmitriy")
        assert is_valid_username("dev-dmitriy")
        assert is_valid_username("dev_1")

    def test_invalid(self):
        assert not is_valid_username("ab")
        assert not is_valid_username("Bad Name")
        assert not is_valid_username("user@example")

    def test_reserved(self):
        for name in ("login", "register", "dashboard", "api", "admin", "public"):
            assert not is_valid_username(name)
