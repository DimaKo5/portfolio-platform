import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { PasswordInput } from "../components/ui/PasswordInput";
import { ApiError } from "../services/api";
import { authApi } from "../services/auth";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors({ email: "Введите корректный email." });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const response = await authApi.resetRequest(email);
      setDevCode(response.dev_code);
      if (response.dev_code) setCode(response.dev_code);
      setStep(2);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось отправить код.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const errs: Record<string, string> = {};
    if (!/^\d{6}$/.test(code)) errs.code = "Код состоит из 6 цифр.";
    if (password.length < 8) errs.password = "Пароль должен быть не короче 8 символов.";
    if (password !== confirm) errs.confirm = "Пароли не совпадают.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await authApi.resetConfirm(email, code, password);
      navigate("/login", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === "INVALID_RESET_CODE") {
        setErrors({ code: "Неверный или истёкший код." });
      } else {
        setError(err instanceof ApiError ? err.message : "Не удалось сбросить пароль.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1 className="auth-title">Забыли пароль?</h1>
        {step === 1 ? (
          <>
            <p className="auth-subtitle">
              Укажите email — мы отправим код подтверждения для сброса пароля.
            </p>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleSendCode} noValidate>
              <Field label="Email" error={errors.email}>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  invalid={!!errors.email}
                />
              </Field>
              <Button type="submit" size="lg" disabled={submitting} className="auth-submit">
                {submitting ? "Отправляем…" : "Отправить код"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className="auth-subtitle">
              Введите код из письма для <strong>{email}</strong> и придумайте новый пароль.
            </p>
            {devCode && (
              <div className="dev-code-banner">
                Режим разработки: письма не настраивались, ваш код —{" "}
                <strong>{devCode}</strong>
              </div>
            )}
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleConfirm} noValidate>
              <Field label="Код подтверждения" error={errors.code}>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  invalid={!!errors.code}
                />
              </Field>
              <Field label="Новый пароль" error={errors.password}>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 8 символов"
                  autoComplete="new-password"
                  invalid={!!errors.password}
                />
              </Field>
              <Field label="Повторите пароль" error={errors.confirm}>
                <PasswordInput
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  invalid={!!errors.confirm}
                />
              </Field>
              <Button type="submit" size="lg" disabled={submitting} className="auth-submit">
                {submitting ? "Проверяем…" : "Сменить пароль"}
              </Button>
              <button
                type="button"
                className="btn btn-ghost auth-submit"
                onClick={() => {
                  setStep(1);
                  setDevCode(null);
                  setCode("");
                }}
              >
                Отправить код ещё раз
              </button>
            </form>
          </>
        )}
        <p className="auth-switch">
          Вспомнили пароль? <Link to="/login">Вернуться ко входу</Link>
        </p>
      </div>
    </div>
  );
}
