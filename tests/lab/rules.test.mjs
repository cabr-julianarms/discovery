import test from "node:test";
import assert from "node:assert/strict";
import { tracks } from "../../config/tracks.ts";
import { detectTrackIds, discoveryCoverage, phaseQuestions } from "../../lib/discovery-rules.ts";

test("matches accented and unaccented opportunities consistently", () => {
  assert.deepEqual(detectTrackIds("Projeto de migração de servidores", tracks), ["migration"]);
  assert.deepEqual(detectTrackIds("Projeto de migracao de servidores", tracks), ["migration"]);
  assert.deepEqual(detectTrackIds("INTELIGÊNCIA ARTIFICIAL", tracks), ["ai"]);
});
test("short signals do not match inside unrelated words", () => {
  assert.deepEqual(detectTrackIds("A companhia precisa de uma reunião comercial", tracks), []);
  assert.deepEqual(detectTrackIds("Uma API com BigQuery", tracks), ["development", "data"]);
  assert.deepEqual(detectTrackIds("", tracks), []);
});
test("coverage measures applicable answers, ignoring empty and unrelated answers", () => {
  const questions = [...tracks[0].questions, ...Object.values(phaseQuestions)];
  assert.equal(discoveryCoverage(questions, {}).percent, 0);
  assert.equal(discoveryCoverage(questions, { unrelated: "answered", [questions[0]]: "   " }).percent, 0);
  const answers = Object.fromEntries(questions.map(question => [question, "Evidência fictícia"]));
  assert.deepEqual(discoveryCoverage(questions, answers), { percent: 100, total: 8, answered: 8, missing: [] });
  assert.equal(discoveryCoverage([...questions, questions[0]], answers).total, 8);
});
test("catalog has stable unique identifiers and nonempty questions", () => {
  assert.equal(new Set(tracks.map(track => track.id)).size, tracks.length);
  for (const track of tracks) {
    assert.ok(track.specialist.trim());
    assert.ok(track.questions.length);
    assert.ok(track.qualificationQuestions.length);
  }
});
