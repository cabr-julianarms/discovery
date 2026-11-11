import test from "node:test";
import assert from "node:assert/strict";
import { listDiscoveries, saveDiscovery } from "../../lib/local-discoveries.ts";

function memory() {
  const entries = new Map();
  return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
}
const draft = { title: "Cliente fictício", outcome: "Validar escopo", problem: "Processo manual", tracks: ["ai"], answers: { objetivo: "Reduzir retrabalho" } };
test("create, reopen and update a project without duplicating or losing answers", () => {
  const storage = memory();
  assert.deepEqual(listDiscoveries(storage), []);
  const saved = saveDiscovery(storage, draft);
  assert.deepEqual(listDiscoveries(storage)[0], saved);
  const updated = saveDiscovery(storage, { ...saved, title: "Novo título" });
  assert.equal(listDiscoveries(storage).length, 1);
  assert.equal(updated.id, saved.id);
  assert.equal(updated.created_at, saved.created_at);
  assert.deepEqual(updated.answers, draft.answers);
});
test("invalid existing storage is never overwritten", () => {
  for (const raw of ["invalid JSON", "{}", '[{"id":"bad"}]']) {
    let written = false;
    const storage = { getItem: () => raw, setItem: () => { written = true; } };
    assert.throws(() => saveDiscovery(storage, draft));
    assert.equal(written, false);
  }
});
test("rejects empty titles and reports write failures", () => {
  assert.throws(() => saveDiscovery(memory(), { ...draft, title: " " }));
  assert.throws(() => saveDiscovery({ getItem: () => null, setItem: () => { throw new Error("Quota exceeded"); } }, draft), /Quota exceeded/);
});
