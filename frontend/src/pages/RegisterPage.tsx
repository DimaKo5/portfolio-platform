import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../services/api";
import { Field, Input } from "../components/ui/Field";
import { PasswordInput } from "../components/ui/PasswordInput";
import { PasswordStrength } from "../components/ui/PasswordStrength";
import { Button } from "../components/ui/Button";
import { scorePassword } from "../utils/passwordStrength";

const USERNAME_RE = /^[a-z0-9][a-z0-9_-]{2,29}$/;

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Введите корректный email.";
    if (!USERNAME_RE.test(username)) {
      errors.username =
        "3–30 символов: строчные латинские буквы, цифры, дефис или подчёркивание. Без пробелов.";
    }
    if (password.length < 8) {
      errors.password = "Пароль должен быть не короче 8 символов.";
    } else if (!scorePassword(password).ok) {
      errors.password = scorePassword(password).hint ?? "Пароль слишком простой.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(email, username, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "EMAIL_ALREADY_EXISTS") {
          setFieldErrors({ email: "Этот email уже зарегистрирован." });
        } else if (err.code === "USERNAME_ALREADY_EXISTS") {
          setFieldErrors({ username: "Этот username уже занят." });
        } else if (err.code === "USERNAME_RESERVED") {
          setFieldErrors({ username: err.message });
        } else {
          setError(err.message);
        }
      } else {
        setError("Регистрация не удалась. Попробуйте ещё раз.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1 className="auth-title">Создайте портфолио</h1>
        <p className="auth-subtitle">
          Показывайте реальные проекты: Проблема → Решение → Результат → Технологии.
        </p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <Field label="Email" error={fieldErrors.email}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              invalid={!!fieldErrors.email}
            />
          </Field>
          <Field
            label="Username"
            hint="ваш публичный адрес: /username"
            error={fieldErrors.username}
          >
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="dmitriy"
              invalid={!!fieldErrors.username}
            />
          </Field>
          <Field label="Пароль" error={fieldErrors.password}>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 8 символов"
              autoComplete="new-password"
              invalid={!!fieldErrors.password}
            />
            <PasswordStrength password={password} />
          </Field>
          <Button type="submit" size="lg" disabled={submitting} className="auth-submit">
            {submitting ? "Создаём аккаунт…" : "Создать аккаунт"}
          </Button>
        </form>
        <p className="auth-switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}
