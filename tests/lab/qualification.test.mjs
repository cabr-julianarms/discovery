import test from "node:test";
import assert from "node:assert/strict";
import {
  assessQualification,
  buildCrmSummary,
  buildDiscoverySummary,
  buildEngineeringHandoff,
  emptyQualification,
  firstMeetingQuestions,
} from "../../lib/qualification.ts";

const catalog = [
  { id: "migration", name: "Migração", specialist: "Arquiteto Cloud", questions: ["Q técnica?"], qualificationQuestions: ["Quantos servidores?"] },
  { id: "data", name: "Dados", specialist: "Especialista Dados", questions: [], qualificationQuestions: ["Qual banco?"] },
];

test("maturity and next action follow the collected evidence", () => {
  const empty = assessQualification(emptyQualification(), catalog);
  assert.equal(empty.maturity, "Contexto ainda não coletado");
  const answers = Object.fromEntries(firstMeetingQuestions.map((question) => [question, "ok"]));
  const ready = assessQualification({ ...emptyQualification(), selectedTracks: ["migration"], answers: { ...answers, "Quantos servidores?": "40" } }, catalog);
  assert.equal(ready.maturity, "Pronta para envolver especialista");
  assert.equal(ready.nextAction, "Acionar Arquiteto Cloud para o próximo aprofundamento.");
  assert.deepEqual(ready.missing, []);
});

test("CRM summary keeps fixed order, extracts company and includes AI suggestions when present", () => {
  const state = {
    ...emptyQualification(),
    context: "Nome da Empresa: ACME Ltda\nQuer migrar.",
    selectedTracks: ["migration"],
    insights: {
      summary: "",
      clientQuestions: [{ question: "Qual o RTO?", reason: "", track: "migration" }],
      opportunities: [{ title: "FinOps", description: "Revisar custos", value: "" }],
      risks: [],
      generatedAt: "2026-01-01T00:00:00.000Z",
    },
  };
  const crm = buildCrmSummary(state, catalog);
  assert.match(crm, /^QUALIFICAÇÃO INICIAL DA OPORTUNIDADE\nCliente: ACME Ltda/);
  assert.match(crm, /1\. OBJETIVO \/ DOR\nA confirmar com o cliente/);
  assert.match(crm, /7\. PERGUNTAS SUGERIDAS PARA A PRÓXIMA CONVERSA\n- Qual o RTO\?/);
  assert.match(crm, /8\. FRENTES A EXPLORAR\n- FinOps: Revisar custos/);
  assert.match(crm, /9\. PRÓXIMA AÇÃO/);
  assert.doesNotMatch(buildCrmSummary({ ...state, insights: undefined }, catalog), /PERGUNTAS SUGERIDAS/);
  assert.match(buildEngineeringHandoff(state, catalog), /Trilhas: Migração[\s\S]*- Quantos servidores\?\n  A confirmar com o cliente/);
});

test("discovery summary groups answers by phase and lists gaps", () => {
  const summary = buildDiscoverySummary(
    { title: "ACME", outcome: "", problem: "", tracks: ["migration"], answers: { "Q técnica?": "Resposta", "Visão?": "" } },
    catalog,
    [{ id: "vision", name: "Objetivo" }, { id: "asis", name: "AS-IS" }],
    { vision: "Visão?" },
  );
  assert.match(summary, /Cobertura: 1\/2 perguntas respondidas/);
  assert.match(summary, /AS-IS\n- Q técnica\?\n  Resposta/);
  assert.match(summary, /LACUNAS\n- Visão\?/);
});

test("discovery summary includes pillars and the 7 Rs table", () => {
  const summary = buildDiscoverySummary(
    { title: "ACME", outcome: "", problem: "", tracks: [], answers: { "Custo?": "R$ 50 mil/mês" },
      workloads: [{ name: "ERP", strategy: "rehost", note: "prazo" }, { name: "BI", strategy: "", note: "" }, { name: " ", strategy: "", note: "" }] },
    catalog, [], {},
    { pillars: [{ name: "Custo", question: "Custo?" }, { name: "Segurança", question: "Segurança?" }], strategies: [{ id: "rehost", name: "Rehost", label: "Mover como está" }] },
  );
  assert.match(summary, /PILARES DO ARCHITECTURE FRAMEWORK\n- Custo\?\n  R\$ 50 mil\/mês/);
  assert.match(summary, /ESTRATÉGIA DE MIGRAÇÃO POR WORKLOAD \(7 Rs\)\n- ERP: Rehost \(Mover como está\) — prazo\n- BI: A definir\n\n/);
  assert.match(summary, /LACUNAS\n- Segurança\?/);
});

test("client name: typed name wins, otherwise common labels are detected", async () => {
  const { extractCompany } = await import("../../lib/qualification.ts");
  assert.equal(extractCompany("Nome da Empresa: ACME Ltda.\nQuer migrar."), "ACME Ltda");
  assert.equal(extractCompany("Cliente: Transportadora Veloz S.A. Querem migrar."), "Transportadora Veloz S.A");
  assert.equal(extractCompany("Conta - Banco Exemplo\nOportunidade de dados"), "Banco Exemplo");
  assert.equal(extractCompany("Reunião com o time de TI sobre migração."), "");
  const state = { ...emptyQualification(), client: "Veloz", context: "Empresa: Outra" };
  assert.match(buildCrmSummary(state, catalog), /Cliente: Veloz/);
  assert.match(buildCrmSummary({ ...state, client: " " }, catalog), /Cliente: Outra/);
});
