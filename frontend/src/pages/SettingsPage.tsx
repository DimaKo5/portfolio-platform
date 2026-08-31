import { FormEvent, useState } from "react";

import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { useToast } from "../hooks/useToast";
import { ApiError } from "../services/api";
import { authApi } from "../services/auth";

export function SettingsPage() {
  const { showSuccess, showError, toastNode } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!current) errs.current = "Введите текущий пароль.";
    if (next.length < 8) errs.next = "Новый пароль должен быть не короче 8 символов.";
    if (next !== confirm) errs.confirm = "Пароли не совпадают.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await authApi.changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      showSuccess("Пароль изменён");
    } catch (err) {
      if (err instanceof ApiError && err.code === "INVALID_CREDENTIALS") {
        setErrors({ current: "Текущий пароль указан неверно." });
      } else {
        showError(err instanceof ApiError ? err.message : "Не удалось изменить пароль.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Настройки</h1>
      <p className="page-subtitle">Безопасность вашего аккаунта.</p>

      <form onSubmit={handleSubmit} noValidate className="card card-pad profile-form">
        <h3 style={{ marginBottom: 20 }}>Смена пароля</h3>

        <Field label="Текущий пароль" error={errors.current}>
          <Input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            invalid={!!errors.current}
          />
        </Field>
        <div className="form-grid">
          <Field label="Новый пароль" error={errors.next}>
            <Input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="Минимум 8 символов"
              autoComplete="new-password"
              invalid={!!errors.next}
            />
          </Field>
          <Field label="Повторите новый пароль" error={errors.confirm}>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              invalid={!!errors.confirm}
            />
          </Field>
        </div>

        <div className="form-actions">
          <Button type="submit" disabled={saving}>
            {saving ? "Сохраняем…" : "Изменить пароль"}
          </Button>
        </div>
      </form>
      {toastNode}
    </div>
  );
}
