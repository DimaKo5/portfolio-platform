import { useMemo, useState } from "react";

import type { Technology } from "../../types";

interface TechSelectProps {
  technologies: Technology[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function TechSelect({ technologies, selectedIds, onChange }: TechSelectProps) {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const filtered = technologies.filter((t) =>
      t.name.toLowerCase().includes(query.toLowerCase()),
    );
    const groups = new Map<string, Technology[]>();
    for (const tech of filtered) {
      const category = tech.category ?? "other";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category)!.push(tech);
    }
    return groups;
  }, [technologies, query]);

  const selectedNames = useMemo(() => {
    const byId = new Map(technologies.map((t) => [t.id, t.name]));
    return selectedIds.map((id) => ({ id, name: byId.get(id) ?? "…" }));
  }, [selectedIds, technologies]);

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id],
    );
  };

  return (
    <div className="tech-select">
      <div className="tech-selected">
        {selectedNames.length === 0 ? (
          <span className="muted">No technologies selected.</span>
        ) : (
          selectedNames.map((tech) => (
            <button
              key={tech.id}
              type="button"
              className="badge badge-tech tech-chip-active"
              onClick={() => toggle(tech.id)}
              title="Remove"
            >
              {tech.name} ✕
            </button>
          ))
        )}
      </div>
      <input
        className="input"
        placeholder="Search technologies…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="tech-groups">
        {[...grouped.entries()].map(([category, techs]) => (
          <div key={category} className="tech-group">
            <span className="tech-group-title">{category}</span>
            <div className="tech-group-items">
              {techs.map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  className={`badge badge-tech ${selectedIds.includes(tech.id) ? "tech-chip-active" : ""}`}
                  onClick={() => toggle(tech.id)}
                >
                  {tech.name}
                </button>
              ))}
            </div>
          </div>
        ))}
        {grouped.size === 0 && <span className="muted">Nothing found.</span>}
      </div>
    </div>
  );
}
