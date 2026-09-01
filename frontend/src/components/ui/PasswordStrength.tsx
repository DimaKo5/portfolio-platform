import { scorePassword } from "../../utils/passwordStrength";

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, hint } = scorePassword(password);

  return (
    <div className="pw-strength">
      <div className="pw-strength-bars" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`pw-seg ${i <= score ? `pw-seg-on-${score}` : ""}`}
          />
        ))}
      </div>
      <span className={`pw-strength-label pw-text-${score}`}>{label}</span>
      {hint && <span className="pw-strength-hint">{hint}</span>}
    </div>
  );
}
