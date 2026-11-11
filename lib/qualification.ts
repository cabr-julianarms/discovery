import type { AiInsights } from "./ai-assist.ts";

/** Subconjunto de Track usado aqui (sem ícones, para rodar nos testes). */
export type TrackInfo = {
  id: string;
  name: string;
  specialist: string;
  questions: string[];
  qualificationQuestions: string[];
};

export const firstMeetingQuestions = [
  "O que o cliente quer melhorar, resolver ou criar?",
  "Como esse processo, sistema ou ambiente funciona hoje?",
  "Quem será impactado ou usará a solução?",
  "Quais tecnologias, sistemas, dados ou ambientes já foram mencionados?",
  "Existe prazo, urgência, orçamento ou algum evento motivando a conversa?",
];

export const PENDING = "A confirmar com o cliente";

export function answerOrPending(value?: string) {
  return value?.trim() || PENDING;
}

export function extractCompany(text: string) {
  return (
    text.match(/Nome da Empresa:\s*([^\n.]+)/i)?.[1]?.trim() ??
    text.match(/Empresa:\s*([^\n.]+)/i)?.[1]?.trim() ??
    text.match(/Cliente:\s*([^\n.]+)/i)?.[1]?.trim() ??
    ""
  );
}

/** Remove e-mails e telefones. Não é anonimização completa. */
export function sanitizeContext(text: string) {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[e-mail removido]")
    .replace(/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?9?\d{4}[-\s]?\d{4}/g, "[telefone removido]");
}

export type QualificationState = {
  context: string;
  selectedTracks: string[];
  answers: Record<string, string>;
  analyzed: boolean;
  insights?: AiInsights;
};

export const emptyQualification = (): QualificationState => ({
  context: "",
  selectedTracks: [],
  answers: {},
  analyzed: false,
});

export function assessQualification(state: QualificationState, catalog: TrackInfo[]) {
  const selected = catalog.filter((track) => state.selectedTracks.includes(track.id));
  const questions = selected.flatMap((track) =>
    track.qualificationQuestions.map((question) => ({ track, question })),
  );
  const has = (question: string) => !!state.answers[question]?.trim();
  const firstMeetingAnswered = firstMeetingQuestions.filter(has).length;
  const technicalAnswered = questions.filter(({ question }) => has(question)).length;
  const company = extractCompany(state.context);

  const maturity = !firstMeetingAnswered
    ? "Contexto ainda não coletado"
    : firstMeetingAnswered < 4
      ? "Contexto inicial"
      : selected.length && technicalAnswered
        ? "Pronta para envolver especialista"
        : "Qualificação comercial registrada";

  const nextAction = !firstMeetingAnswered
    ? "Realizar a primeira conversa usando o roteiro universal."
    : !selected.length
      ? "Continuar a qualificação comercial; ainda não há sinal técnico suficiente para envolver Engenharia."
      : !technicalAnswered
        ? "Coletar as perguntas das trilhas antes de abrir uma agenda técnica."
        : `Acionar ${selected.map((track) => track.specialist).join(" + ")} para o próximo aprofundamento.`;

  const missing = [...firstMeetingQuestions, ...questions.map(({ question }) => question)].filter(
    (question) => !has(question),
  );

  return { selected, questions, firstMeetingAnswered, technicalAnswered, company, maturity, nextAction, missing };
}

function insightSections(insights?: AiInsights): [string, string[]][] {
  if (!insights) return [];
  const sections: [string, string[]][] = [];
  if (insights.clientQuestions.length)
    sections.push([
      "PERGUNTAS SUGERIDAS PARA A PRÓXIMA CONVERSA",
      insights.clientQuestions.map((item) => `- ${item.question}`),
    ]);
  if (insights.opportunities.length)
    sections.push([
      "FRENTES A EXPLORAR",
      insights.opportunities.map((item) => `- ${item.title}: ${item.description}`),
    ]);
  if (insights.risks.length)
    sections.push(["RISCOS E PONTOS DE ATENÇÃO", insights.risks.map((risk) => `- ${risk}`)]);
  return sections;
}

function numbered(header: string[], sections: [string, string[]][]) {
  return [
    ...header,
    ...sections.flatMap(([title, lines], index) => ["", `${index + 1}. ${title}`, ...lines]),
  ].join("\n");
}

export function buildCrmSummary(state: QualificationState, catalog: TrackInfo[]) {
  const a = assessQualification(state, catalog);
  const trackNames = a.selected.length ? a.selected.map((track) => track.name).join(", ") : "Nenhuma confirmada";
  return numbered(
    ["QUALIFICAÇÃO INICIAL DA OPORTUNIDADE", `Cliente: ${a.company || "A confirmar"}`, `Status: ${a.maturity}`],
    [
      ["OBJETIVO / DOR", [answerOrPending(state.answers[firstMeetingQuestions[0]])]],
      ["CENÁRIO ATUAL", [answerOrPending(state.answers[firstMeetingQuestions[1]])]],
      ["USUÁRIOS / ÁREAS IMPACTADAS", [answerOrPending(state.answers[firstMeetingQuestions[2]])]],
      [
        "TECNOLOGIAS E TRILHAS IDENTIFICADAS",
        [answerOrPending(state.answers[firstMeetingQuestions[3]]), `Trilhas: ${trackNames}`],
      ],
      ["PRAZO / URGÊNCIA / ORÇAMENTO", [answerOrPending(state.answers[firstMeetingQuestions[4]])]],
      [
        "LACUNAS PARA A PRÓXIMA CONVERSA",
        a.missing.length ? a.missing.map((item) => `- ${item}`) : ["- Nenhuma lacuna registrada"],
      ],
      ...insightSections(state.insights),
      ["PRÓXIMA AÇÃO", [a.nextAction]],
    ],
  );
}

export function buildEngineeringHandoff(state: QualificationState, catalog: TrackInfo[]) {
  const a = assessQualification(state, catalog);
  const trackNames = a.selected.length ? a.selected.map((track) => track.name).join(", ") : "Nenhuma confirmada";
  const lines = [
    "HANDOFF PADRÃO PARA ENGENHARIA",
    `Cliente: ${a.company || "A confirmar"}`,
    `Maturidade: ${a.maturity}`,
    `Trilhas: ${trackNames}`,
    "",
    "Objetivo do cliente:",
    answerOrPending(state.answers[firstMeetingQuestions[0]]),
    "",
    "Cenário atual:",
    answerOrPending(state.answers[firstMeetingQuestions[1]]),
    "",
    "Respostas técnicas já coletadas:",
    ...(a.questions.length
      ? a.questions.map(({ question }) => `- ${question}\n  ${answerOrPending(state.answers[question])}`)
      : ["- Ainda não coletadas"]),
  ];
  for (const [title, items] of insightSections(state.insights)) lines.push("", `${title}:`, ...items);
  lines.push(
    "",
    "Resultado esperado da próxima conversa:",
    "Validar cenário, fechar lacunas e definir se existe base para arquitetura, demo, sizing ou proposta.",
  );
  return lines.join("\n");
}

export type DiscoverySummaryInput = {
  title: string;
  outcome: string;
  problem: string;
  tracks: string[];
  answers: Record<string, string>;
  insights?: AiInsights;
};

export function buildDiscoverySummary(
  draft: DiscoverySummaryInput,
  catalog: TrackInfo[],
  phaseList: { id: string; name: string }[],
  phaseQuestions: Record<string, string>,
) {
  const selected = catalog.filter((track) => draft.tracks.includes(track.id));
  const byPhase = phaseList.map((phase) => ({
    phase,
    questions: phase.id === "asis" ? selected.flatMap((track) => track.questions) : [phaseQuestions[phase.id]].filter(Boolean),
  }));
  const all = [...new Set(byPhase.flatMap((item) => item.questions))];
  const missing = all.filter((question) => !draft.answers[question]?.trim());
  const lines = [
    "RESUMO DO DISCOVERY TÉCNICO",
    `Cliente / oportunidade: ${draft.title.trim() || "A confirmar"}`,
    `Resultado esperado: ${draft.outcome.trim() || "A confirmar"}`,
    `Trilhas: ${selected.length ? selected.map((track) => track.name).join(", ") : "Nenhuma selecionada"}`,
    `Especialistas: ${selected.length ? selected.map((track) => track.specialist).join(", ") : "A definir"}`,
    `Cobertura: ${all.length - missing.length}/${all.length} perguntas respondidas`,
  ];
  for (const { phase, questions } of byPhase) {
    const answered = questions.filter((question) => draft.answers[question]?.trim());
    if (!answered.length) continue;
    lines.push("", phase.name.toUpperCase());
    for (const question of answered) lines.push(`- ${question}`, `  ${draft.answers[question].trim()}`);
  }
  lines.push("", "LACUNAS", ...(missing.length ? missing.map((item) => `- ${item}`) : ["- Nenhuma"]));
  for (const [title, items] of insightSections(draft.insights)) lines.push("", title, ...items);
  return lines.join("\n");
}
