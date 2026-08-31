import { useState } from "react";
import { profileApi } from "../../services/profile";
import { ApiError } from "../../services/api";

interface AvatarUploadProps {
  url: string | null;
  onUploaded: (url: string) => void;
}

export function AvatarUpload({ url, onUploaded }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const response = await profileApi.uploadAvatar(file);
      onUploaded(response.avatar_url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="avatar-upload">
      <label className="avatar-upload-frame">
        {url ? (
          <img src={url} alt="Avatar" className="avatar-img" />
        ) : (
          <span className="avatar-placeholder">Upload photo</span>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} hidden />
        {uploading && <span className="avatar-uploading">Uploading…</span>}
      </label>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
