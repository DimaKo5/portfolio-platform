import type { ProjectStatus } from "../../types";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`badge ${status === "PUBLISHED" ? "badge-published" : "badge-draft"}`}>
      {status === "PUBLISHED" ? "Опубликован" : "Черновик"}
    </span>
  );
}
