import type { AiInsights } from "./ai-assist.ts";

export type DiscoveryDraft = {
  id?: string;
  title: string;
  outcome: string;
  problem: string;
  tracks: string[];
  answers: Record<string, string>;
  insights?: AiInsights;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

type Storage = Pick<globalThis.Storage, "getItem" | "setItem">;
const key = "discovery-architecture-lab:projects:v1";

export const emptyDraft = (): DiscoveryDraft => ({
  title: "",
  outcome: "",
  problem: "",
  tracks: [],
  answers: {},
  status: "draft",
});

function isDraft(value: unknown): value is DiscoveryDraft {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && typeof row.title === "string" &&
    typeof row.outcome === "string" && typeof row.problem === "string" &&
    Array.isArray(row.tracks) && row.tracks.every(item => typeof item === "string") &&
    !!row.answers && typeof row.answers === "object" && !Array.isArray(row.answers) &&
    Object.values(row.answers).every(item => typeof item === "string") &&
    (row.insights === undefined || (!!row.insights && typeof row.insights === "object" && !Array.isArray(row.insights))) &&
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

export function deleteDiscovery(storage: Storage, id: string) {
  const projects = listDiscoveries(storage);
  storage.setItem(key, JSON.stringify(projects.filter(project => project.id !== id)));
}

export function exportDiscoveries(storage: Storage, ids?: string[]) {
  const projects = listDiscoveries(storage).filter(project => !ids || ids.includes(project.id!));
  return JSON.stringify({ app: "discovery-architecture-lab", version: 1, exported_at: new Date().toISOString(), projects }, null, 2);
}

/** Importa projetos de um arquivo exportado. Em caso de mesmo id, fica a versão mais recente. */
export function importDiscoveries(storage: Storage, json: string) {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("O arquivo não é um JSON válido.");
  }
  const rows = Array.isArray(data) ? data : (data as { projects?: unknown })?.projects;
  if (!Array.isArray(rows) || !rows.every(isDraft)) throw new Error("O arquivo não contém projetos do Discovery Lab.");
  const current = listDiscoveries(storage);
  const byId = new Map(current.map(project => [project.id!, project]));
  let imported = 0;
  for (const row of rows) {
    const existing = byId.get(row.id!);
    if (existing && (existing.updated_at ?? "") >= (row.updated_at ?? "")) continue;
    byId.set(row.id!, row);
    imported++;
  }
  storage.setItem(key, JSON.stringify([...byId.values()]));
  return { imported, skipped: rows.length - imported };
}
