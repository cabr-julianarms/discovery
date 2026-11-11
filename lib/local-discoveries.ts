export type DiscoveryDraft = {
  id?: string;
  title: string;
  outcome: string;
  problem: string;
  tracks: string[];
  answers: Record<string, string>;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

type Storage = Pick<globalThis.Storage, "getItem" | "setItem">;
const key = "discovery-architecture-lab:projects:v1";

function isDraft(value: unknown): value is DiscoveryDraft {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && typeof row.title === "string" &&
    typeof row.outcome === "string" && typeof row.problem === "string" &&
    Array.isArray(row.tracks) && row.tracks.every(item => typeof item === "string") &&
    !!row.answers && typeof row.answers === "object" && !Array.isArray(row.answers) &&
    Object.values(row.answers).every(item => typeof item === "string") &&
    [row.status, row.created_at, row.updated_at].every(item => item === undefined || typeof item === "string");
}

export function listDiscoveries(storage: Storage): DiscoveryDraft[] {
  const raw = storage.getItem(key);
  if (!raw) return [];
  const rows: unknown = JSON.parse(raw);
  if (!Array.isArray(rows) || !rows.every(isDraft)) {
    throw new Error("Os dados locais não puderam ser lidos. Preserve os dados do navegador antes de tentar novamente.");
  }
  return rows.sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
}

export function saveDiscovery(storage: Storage, draft: DiscoveryDraft): DiscoveryDraft {
  if (!draft.title.trim()) throw new Error("Informe um nome para o discovery.");
  const projects = listDiscoveries(storage);
  const previous = draft.id ? projects.find(project => project.id === draft.id) : undefined;
  const now = new Date().toISOString();
  const saved = {
    ...draft, title: draft.title.trim(), id: draft.id || crypto.randomUUID(),
    tracks: [...draft.tracks], answers: { ...draft.answers },
    created_at: previous?.created_at ?? now, updated_at: now,
  };
  storage.setItem(key, JSON.stringify([saved, ...projects.filter(project => project.id !== saved.id)]));
  return saved;
}
