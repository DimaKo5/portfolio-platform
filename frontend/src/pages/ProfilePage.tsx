import { FormEvent, useEffect, useState } from "react";

import { AvatarUpload } from "../components/profile/AvatarUpload";
import { Button } from "../components/ui/Button";
import { Field, Input, Textarea } from "../components/ui/Field";
import { useToast } from "../hooks/useToast";
import { ApiError } from "../services/api";
import { profileApi } from "../services/profile";
import type { Profile } from "../types";

export function ProfilePage() {
  const { showSuccess, showError, toastNode } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    profileApi
      .get()
      .then(setProfile)
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const setField = (name: keyof Profile, value: string) => {
    setProfile((prev) => (prev ? { ...prev, [name]: value === "" ? null : value } : prev));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await profileApi.update(profile);
      setProfile(updated);
      showSuccess("Profile saved");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to save profile. Check the URLs.",
      );
      showError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!profile) {
    return <div className="error-banner">{error ?? "Profile not found."}</div>;
  }

  return (
    <div className="page">
      <h1 className="page-title">Profile</h1>
      <p className="page-subtitle">This information appears on your public portfolio.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="card card-pad profile-form">
          <div className="profile-avatar-row">
            <AvatarUpload
              url={profile.avatar_url}
              onUploaded={(url) => setProfile({ ...profile, avatar_url: url })}
            />
            <div>
              <h3>Photo</h3>
              <p className="muted">JPEG, PNG or WebP up to 5 MB.</p>
            </div>
          </div>

          <div className="form-grid">
            <Field label="Display name">
              <Input
                value={profile.display_name ?? ""}
                onChange={(e) => setField("display_name", e.target.value)}
                placeholder="Dmitriy K."
                maxLength={120}
              />
            </Field>
            <Field label="Profession / headline">
              <Input
                value={profile.headline ?? ""}
                onChange={(e) => setField("headline", e.target.value)}
                placeholder="Python & Full-Stack Developer"
                maxLength={160}
              />
            </Field>
          </div>

          <Field label="Short bio">
            <Textarea
              value={profile.bio ?? ""}
              onChange={(e) => setField("bio", e.target.value)}
              placeholder="I build automation tools and web applications."
              maxLength={2000}
              rows={4}
            />
          </Field>

          <Field label="Location" hint="optional">
            <Input
              value={profile.location ?? ""}
              onChange={(e) => setField("location", e.target.value)}
              placeholder="Moscow"
              maxLength={120}
            />
          </Field>

          <div className="form-grid">
            <Field label="Website">
              <Input
                type="url"
                value={profile.website_url ?? ""}
                onChange={(e) => setField("website_url", e.target.value)}
                placeholder="https://example.com"
              />
            </Field>
            <Field label="GitHub link">
              <Input
                type="url"
                value={profile.github_url ?? ""}
                onChange={(e) => setField("github_url", e.target.value)}
                placeholder="https://github.com/username"
              />
            </Field>
            <Field label="Telegram">
              <Input
                type="url"
                value={profile.telegram_url ?? ""}
                onChange={(e) => setField("telegram_url", e.target.value)}
                placeholder="https://t.me/username"
              />
            </Field>
            <Field label="LinkedIn">
              <Input
                type="url"
                value={profile.linkedin_url ?? ""}
                onChange={(e) => setField("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </Field>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="form-actions">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </div>
      </form>
      {toastNode}
    </div>
  );
}
