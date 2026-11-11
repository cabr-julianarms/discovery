import test from "node:test";
import assert from "node:assert/strict";
import { buildPrompt, parseAiResponse } from "../../lib/ai-assist.ts";

const catalog = [
  { id: "migration", name: "Migração & Cloud", short: "Inventário" },
  { id: "data", name: "Dados & DW", short: "Fontes" },
];
const questions = [
  { text: "Qual o objetivo?", group: "Primeira conversa" },
  { text: "Quantos servidores existem?", group: "Migração & Cloud" },
  { text: "Qual banco é usado?", group: "Dados & DW" },
];
const input = {
  mode: "qualificacao",
  context: "Cliente quer sair do datacenter. Contato: joao@empresa.com, (11) 98765-4321. São 40 VMs.",
  catalog,
  selectedTracks: ["migration"],
  questions,
  answers: { "Qual o objetivo?": "Sair do datacenter até junho", "Pergunta da qualificação": "Usam SQL Server 2016" },
};

test("prompt lists open questions with ids, keeps answered ones out of the open list and strips contact data", () => {
  const prompt = buildPrompt(input);
  assert.match(prompt, /\[P02\] \(Migração & Cloud\) Quantos servidores existem\?/);
  assert.match(prompt, /\[P03\] \(Dados & DW\) Qual banco é usado\?/);
  assert.doesNotMatch(prompt, /\[P01\] \(Primeira conversa\)/);
  assert.match(prompt, /\[P01\] Qual o objetivo\?\n→ Sair do datacenter/);
  assert.match(prompt, /OUTRAS INFORMAÇÕES JÁ COLETADAS[\s\S]*SQL Server 2016/);
  assert.doesNotMatch(prompt, /joao@empresa\.com/);
  assert.doesNotMatch(prompt, /98765-4321/);
  assert.match(prompt, /- migration: Migração & Cloud/);
});

const response = `Claro! Aqui está:
\`\`\`json
{
  "resumo": "Migração de 40 VMs.",
  "trilhas": [
    { "id": "migration", "motivo": "Sair do datacenter", "confianca": "alta" },
    { "id": "data", "motivo": "Banco citado", "confianca": "média" },
    { "id": "inexistente", "motivo": "x", "confianca": "alta" }
  ],
  "respostas": [
    { "id": "P02", "resposta": "40 VMs", "evidencia": "São 40 VMs", "tipo": "explicito" },
    { "id": "P3", "resposta": "Provavelmente SQL Server", "evidencia": "", "tipo": "inferido" },
    { "id": "P01", "resposta": "não deveria sobrescrever", "evidencia": "", "tipo": "explicito" },
    { "id": "P99", "resposta": "fantasma", "evidencia": "", "tipo": "explicito" }
  ],
  "perguntas_cliente": [{ "pergunta": "Qual o RTO?", "motivo": "Define a estratégia", "trilha": "migration" }],
  "frentes": [{ "titulo": "FinOps", "descricao": "Revisar custos", "valor": "Economia" }],
  "riscos": ["Licenças Windows", ""],
}
\`\`\`
Espero ter ajudado.`;

test("parses fenced JSON with trailing comma, maps ids back to questions and never overwrites answers", () => {
  const result = parseAiResponse(response, input);
  assert.deepEqual(result.tracks.map((track) => [track.id, track.confidence]), [["migration", "alta"], ["data", "media"]]);
  assert.deepEqual(result.answers, [
    { question: "Quantos servidores existem?", answer: "40 VMs", evidence: "São 40 VMs", inferred: false },
    { question: "Qual banco é usado?", answer: "Provavelmente SQL Server", evidence: "", inferred: true },
  ]);
  assert.equal(result.insights.clientQuestions[0].question, "Qual o RTO?");
  assert.equal(result.insights.opportunities[0].title, "FinOps");
  assert.deepEqual(result.insights.risks, ["Licenças Windows"]);
  assert.equal(result.warnings.length, 2);
});

test("explains clearly when the pasted text is not usable", () => {
  assert.throws(() => parseAiResponse("Desculpe, não posso ajudar.", input), /Não encontrei um JSON/);
  assert.throws(() => parseAiResponse("{ isto não é json }", input), /JSON válido/);
  assert.throws(() => parseAiResponse('{"resumo": "só isso"}', input), /vazia/);
});
