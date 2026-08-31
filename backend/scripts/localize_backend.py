# One-off localization script: translate user-facing backend messages to Russian.
import pathlib

REPLACEMENTS = {
    "app/services/auth_service.py": [
        ("This username is reserved. Choose another one.",
         "Этот username зарезервирован системой. Выберите другой."),
        ("This email is already registered.",
         "Этот email уже зарегистрирован."),
        ("This username is already taken.",
         "Этот username уже занят."),
        ("Incorrect email or password.",
         "Неверный email или пароль."),
    ],
    "app/services/project_service.py": [
        ("Order contains projects you do not own.",
         "В списке есть проекты, которые вам не принадлежат."),
        ("Project not found.", "Проект не найден."),
    ],
    "app/services/portfolio_service.py": [
        ("Portfolio not found.", "Портфолио не найдено."),
        ("Project not found.", "Проект не найден."),
    ],
    "app/services/technology_service.py": [
        ("Project not found.", "Проект не найден."),
        ("One or more technologies not found.", "Одна или несколько технологий не найдены."),
    ],
    "app/api/images.py": [
        ("Project not found.", "Проект не найден."),
        ("Image not found.", "Изображение не найдено."),
    ],
    "app/utils/images.py": [
        ("Only JPEG, PNG or WebP images are allowed.",
         "Поддерживаются только изображения JPEG, PNG или WebP."),
        ("Image exceeds the maximum size of", "Файл превышает максимальный размер"),
        ("MB.", "МБ."),
    ],
    "app/utils/errors.py": [
        ("Invalid request data.", "Некорректные данные запроса."),
        ("An unexpected error occurred.", "Внутренняя ошибка сервера."),
    ],
    "app/main.py": [
        ("Resource not found.", "Ресурс не найден."),
    ],
}

for path, pairs in REPLACEMENTS.items():
    p = pathlib.Path(path)
    text = p.read_text(encoding="utf-8")
    changed = False
    for old, new in pairs:
        if old in text:
            text = text.replace(old, new)
            changed = True
    if changed:
        p.write_text(text, encoding="utf-8", newline="\n")
        print("updated", path)
    else:
        print("no change", path)
