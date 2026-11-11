import test from "node:test";
import assert from "node:assert/strict";
import { deleteDiscovery, exportDiscoveries, importDiscoveries, listDiscoveries, mergeWorkloads, saveDiscovery } from "../../lib/local-discoveries.ts";

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
test("delete, export and import move projects between browsers without losing newer work", () => {
  const source = memory();
  const a = saveDiscovery(source, draft);
  const b = saveDiscovery(source, { ...draft, title: "Outro cliente" });
  const file = exportDiscoveries(source, [a.id]);
  assert.equal(JSON.parse(file).projects.length, 1);

  const target = memory();
  assert.deepEqual(importDiscoveries(target, exportDiscoveries(source)), { imported: 2, skipped: 0 });
  const newer = saveDiscovery(target, { ...a, title: "Editado aqui" });
  assert.deepEqual(importDiscoveries(target, file), { imported: 0, skipped: 1 });
  assert.equal(listDiscoveries(target).find(project => project.id === a.id).title, newer.title);

  deleteDiscovery(target, b.id);
  assert.deepEqual(listDiscoveries(target).map(project => project.id), [a.id]);
  assert.throws(() => importDiscoveries(target, "não é json"), /JSON válido/);
  assert.throws(() => importDiscoveries(target, '{"projects":[{"id":1}]}'), /não contém projetos/);
});

test("workloads are saved, validated and merged without overwriting decisions", () => {
  const storage = memory();
  const saved = saveDiscovery(storage, { ...draft, workloads: [{ name: "ERP", strategy: "rehost", note: "" }] });
  assert.deepEqual(listDiscoveries(storage)[0].workloads, saved.workloads);
  assert.throws(() => importDiscoveries(memory(), JSON.stringify([{ ...saved, workloads: [{ name: 1 }] }])), /não contém projetos/);
  const merged = mergeWorkloads(
    [{ name: "ERP", strategy: "rehost", note: "decidido" }, { name: "BI", strategy: "", note: "" }],
    [{ name: "erp", strategy: "refactor", note: "IA" }, { name: "bi", strategy: "replatform", note: "IA" }, { name: "Intranet", strategy: "retire", note: "" }],
  );
  assert.deepEqual(merged, [
    { name: "ERP", strategy: "rehost", note: "decidido" },
    { name: "BI", strategy: "replatform", note: "IA" },
    { name: "Intranet", strategy: "retire", note: "" },
  ]);
});
