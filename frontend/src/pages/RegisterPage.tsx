import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../services/api";
import { Field, Input } from "../components/ui/Field";
import { Button } from "../components/ui/Button";

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
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address.";
    if (!USERNAME_RE.test(username)) {
      errors.username =
        "3–30 characters: lowercase letters, digits, dash or underscore. No spaces.";
    }
    if (password.length < 8) errors.password = "Password must be at least 8 characters.";
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
          setFieldErrors({ email: "This email is already registered." });
        } else if (err.code === "USERNAME_ALREADY_EXISTS" || err.code === "USERNAME_RESERVED") {
          setFieldErrors({ username: err.message });
        } else {
          setError(err.message);
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1 className="auth-title">Create your portfolio</h1>
        <p className="auth-subtitle">
          Show real projects: Problem → Solution → Result → Tech Stack.
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
            hint="Your public URL: /username"
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
          <Field label="Password" error={fieldErrors.password}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              invalid={!!fieldErrors.password}
            />
          </Field>
          <Button type="submit" size="lg" disabled={submitting} className="auth-submit">
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
