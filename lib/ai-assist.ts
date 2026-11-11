import { sanitizeContext } from "./qualification.ts";

/**
 * Análise com IA sem API: o site monta um prompt, a pessoa cola no assistente
 * de IA da empresa (ChatGPT, Gemini…) e cola a resposta de volta. Nada sai do
 * navegador sem a pessoa copiar.
 */

/** Edite aqui para ajustar o contexto que a IA recebe sobre quem está fazendo o discovery. */
export const COMPANY_CONTEXT =
  "A consultoria é parceira Google Cloud e atua com migração, modernização de aplicações, dados e analytics, IA generativa (Gemini Enterprise, Vertex AI), DevOps e infraestrutura. Quando fizer sentido, cite serviços Google Cloud, mas sem forçar.";

const MAX_CONTEXT = 12000;

export type AiQuestion = { text: string; group: string };

export type AiPromptInput = {
  mode: "qualificacao" | "discovery";
  context: string;
  fields?: Record<string, string>;
  catalog: { id: string; name: string; short: string }[];
  selectedTracks: string[];
  questions: AiQuestion[];
  answers: Record<string, string>;
  /** Quando presente, pede à IA a estratégia de migração (7 Rs) por workload. */
  strategies?: readonly { id: string; name: string; label: string }[];
  workloads?: { name: string; strategy: string }[];
};

export type AiWorkload = { name: string; strategy: string; note: string };

export type Confidence = "alta" | "media" | "baixa";
export type AiTrackSuggestion = { id: string; reason: string; confidence: Confidence };
export type AiAnswerSuggestion = { question: string; answer: string; evidence: string; inferred: boolean };
export type AiClientQuestion = { question: string; reason: string; track: string };
export type AiOpportunity = { title: string; description: string; value: string };

export type AiInsights = {
  summary: string;
  clientQuestions: AiClientQuestion[];
  opportunities: AiOpportunity[];
  risks: string[];
  generatedAt: string;
};

export type AiResult = {
  /** Nome do cliente, quando aparece no material. */
  client: string;
  insights: AiInsights;
  tracks: AiTrackSuggestion[];
  answers: AiAnswerSuggestion[];
  workloads: AiWorkload[];
  warnings: string[];
};

const questionId = (index: number) => `P${String(index + 1).padStart(2, "0")}`;

export function buildPrompt(input: AiPromptInput) {
  const known = new Set(input.questions.map((question) => question.text));
  const answered = input.questions
    .map((question, index) => ({ ...question, id: questionId(index) }))
    .filter((question) => input.answers[question.text]?.trim());
  const open = input.questions
    .map((question, index) => ({ ...question, id: questionId(index) }))
    .filter((question) => !input.answers[question.text]?.trim());
  const extra = Object.entries(input.answers).filter(([question, answer]) => !known.has(question) && answer.trim());

  const material = sanitizeContext(
    [
      ...Object.entries(input.fields ?? {})
        .filter(([, value]) => value.trim())
        .map(([label, value]) => `${label}: ${value.trim()}`),
      input.context.trim(),
    ]
      .filter(Boolean)
      .join("\n\n"),
  ).slice(0, MAX_CONTEXT);

  const stage =
    input.mode === "qualificacao"
      ? "primeira conversa de qualificação (pré-vendas), ainda sem especialista técnico"
      : "discovery técnico de arquitetura, conduzido com o especialista";

  const strategies = input.strategies ?? [];
  const example = {
    cliente: "Nome da empresa cliente, se aparecer no material; senão, vazio.",
    resumo: "Duas ou três frases sobre a oportunidade.",
    trilhas: [{ id: input.catalog[0]?.id ?? "migration", motivo: "Por que se aplica, citando o material.", confianca: "alta" }],
    respostas: [{ id: "P01", resposta: "Resposta objetiva.", evidencia: "Trecho copiado do material.", tipo: "explicito" }],
    ...(strategies.length
      ? { workloads: [{ nome: "Nome do sistema ou servidor", estrategia: strategies[0].id, motivo: "Por que essa estratégia." }] }
      : {}),
    perguntas_cliente: [{ pergunta: "Pergunta clara para o cliente?", motivo: "O que ela destrava.", trilha: input.catalog[0]?.id ?? "geral" }],
    frentes: [{ titulo: "Nome curto", descricao: "O que explorar.", valor: "Benefício para o cliente." }],
    riscos: ["Risco ou ponto de atenção."],
  };
  const workloadSection = strategies.length
    ? [
        "",
        "ESTRATÉGIA DE MIGRAÇÃO POR WORKLOAD (7 Rs)",
        'Para cada sistema, servidor ou banco citado no material, sugira uma estratégia em "workloads". Use só estes IDs:',
        ...strategies.map((strategy) => `- ${strategy.id}: ${strategy.name} (${strategy.label})`),
        `Workloads já registrados: ${
          input.workloads?.length
            ? input.workloads.map((item) => `${item.name}${item.strategy ? ` → ${item.strategy}` : " (sem estratégia)"}`).join("; ")
            : "nenhum"
        }`,
        "Não invente workloads que o material não cita. Se faltar informação para decidir, diga no motivo o que precisa ser confirmado.",
      ]
    : [];

  return [
    "Você é um(a) arquiteto(a) de soluções sênior apoiando o time de pré-vendas.",
    COMPANY_CONTEXT,
    `Etapa atual: ${stage}.`,
    "",
    "TAREFA",
    "Analise o material e devolva:",
    "1. as trilhas técnicas que se aplicam (use apenas os IDs da lista);",
    "2. respostas para as perguntas em aberto, SOMENTE quando o material trouxer a informação;",
    "3. perguntas para fazer ao cliente na próxima conversa, priorizando as lacunas que mais afetam escopo, esforço e risco;",
    "4. frentes ou oportunidades adicionais que valem ser exploradas;",
    "5. riscos e pontos de atenção.",
    ...(strategies.length ? ["6. a estratégia de migração (7 Rs) para cada workload citado."] : []),
    "",
    "REGRAS",
    "- Não invente fatos. Se o material não traz a informação, não responda a pergunta: ela continua como lacuna.",
    '- Em "evidencia", copie o trecho do material que sustenta a resposta. Use "tipo": "inferido" quando for dedução e não algo dito.',
    "- Não repita nem altere as respostas já registradas.",
    "- Perguntas para o cliente devem ser simples, sem jargão, e não podem repetir o que já foi respondido.",
    "- Português do Brasil, frases curtas.",
    "- Limites: até 10 perguntas para o cliente, até 5 frentes, até 5 riscos.",
    "- Responda APENAS com um bloco ```json no formato do exemplo, sem texto antes ou depois.",
    "",
    "TRILHAS DISPONÍVEIS",
    ...input.catalog.map((track) => `- ${track.id}: ${track.name} — ${track.short}`),
    `Trilhas já marcadas: ${input.selectedTracks.length ? input.selectedTracks.join(", ") : "nenhuma"}`,
    "",
    "MATERIAL DO CLIENTE",
    '"""',
    material || "(nenhum material colado ainda)",
    '"""',
    "",
    "RESPOSTAS JÁ REGISTRADAS",
    ...(answered.length
      ? answered.map((question) => `[${question.id}] ${question.text}\n→ ${input.answers[question.text].trim()}`)
      : ["(nenhuma)"]),
    ...(extra.length
      ? ["", "OUTRAS INFORMAÇÕES JÁ COLETADAS", ...extra.map(([question, answer]) => `- ${question}\n  → ${sanitizeContext(answer.trim())}`)]
      : []),
    "",
    'PERGUNTAS EM ABERTO (use o ID no campo "id" de "respostas")',
    ...(open.length ? open.map((question) => `[${question.id}] (${question.group}) ${question.text}`) : ["(nenhuma)"]),
    ...workloadSection,
    "",
    "FORMATO DA RESPOSTA",
    "```json",
    JSON.stringify(example, null, 2),
    "```",
  ].join("\n");
}

function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const source = fenced ?? raw;
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Não encontrei um JSON na resposta. Cole a resposta completa da IA.");
  const body = source.slice(start, end + 1);
  try {
    return JSON.parse(body);
  } catch {
    try {
      // Tolerância: aspas tipográficas e vírgula sobrando são comuns em respostas coladas.
      return JSON.parse(body.replace(/[“”]/g, '"').replace(/,\s*([}\]])/g, "$1"));
    } catch {
      throw new Error("A resposta não está em JSON válido. Peça à IA: \"responda só com o bloco JSON\" e cole de novo.");
    }
  }
}

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const list = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => !!item && typeof item === "object") : [];

export function parseAiResponse(
  raw: string,
  input: Pick<AiPromptInput, "questions" | "catalog" | "answers" | "strategies">,
): AiResult {
  const data = extractJson(raw);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("A resposta não tem o formato esperado.");
  const root = data as Record<string, unknown>;
  const warnings: string[] = [];
  const trackIds = new Set(input.catalog.map((track) => track.id));

  const tracks: AiTrackSuggestion[] = [];
  for (const item of list(root.trilhas)) {
    const id = text(item.id);
    if (!trackIds.has(id)) {
      if (id) warnings.push(`Trilha desconhecida ignorada: ${id}`);
      continue;
    }
    if (tracks.some((track) => track.id === id)) continue;
    const confidence = text(item.confianca).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    tracks.push({
      id,
      reason: text(item.motivo),
      confidence: confidence === "alta" || confidence === "baixa" ? confidence : "media",
    });
  }

  const answers: AiAnswerSuggestion[] = [];
  for (const item of list(root.respostas)) {
    const match = text(item.id).toUpperCase().match(/^P?(\d+)$/);
    const question = match ? input.questions[Number(match[1]) - 1]?.text : undefined;
    const answer = text(item.resposta);
    if (!question || !answer) {
      warnings.push(`Resposta ignorada (pergunta não encontrada: ${text(item.id) || "sem id"}).`);
      continue;
    }
    if (input.answers[question]?.trim() || answers.some((existing) => existing.question === question)) continue;
    answers.push({ question, answer, evidence: text(item.evidencia), inferred: text(item.tipo).toLowerCase() !== "explicito" });
  }

  const insights: AiInsights = {
    summary: text(root.resumo),
    clientQuestions: list(root.perguntas_cliente)
      .map((item) => ({ question: text(item.pergunta), reason: text(item.motivo), track: text(item.trilha) || "geral" }))
      .filter((item) => item.question)
      .slice(0, 15),
    opportunities: list(root.frentes)
      .map((item) => ({ title: text(item.titulo), description: text(item.descricao), value: text(item.valor) }))
      .filter((item) => item.title || item.description)
      .slice(0, 8),
    risks: (Array.isArray(root.riscos) ? root.riscos : []).map(text).filter(Boolean).slice(0, 8),
    generatedAt: new Date().toISOString(),
  };

  const strategyIds = new Set((input.strategies ?? []).map((strategy) => strategy.id));
  const workloads: AiWorkload[] = [];
  if (strategyIds.size) {
    for (const item of list(root.workloads)) {
      const name = text(item.nome);
      if (!name || workloads.some((existing) => existing.name.toLowerCase() === name.toLowerCase())) continue;
      const strategy = text(item.estrategia).toLowerCase();
      if (strategy && !strategyIds.has(strategy)) warnings.push(`Estratégia desconhecida para ${name}: ${strategy}`);
      workloads.push({ name, strategy: strategyIds.has(strategy) ? strategy : "", note: text(item.motivo) });
    }
  }

  if (!tracks.length && !answers.length && !workloads.length && !insights.clientQuestions.length && !insights.opportunities.length)
    throw new Error("A resposta veio vazia. Confira se colou a resposta inteira da IA.");

  const client = text(root.cliente).slice(0, 80);
  return { client: /^nome da empresa/i.test(client) ? "" : client, insights, tracks, answers, workloads, warnings };
}

/** Texto gravado na resposta quando a IA deduziu em vez de encontrar no material. */
export const INFERRED_PREFIX = "[A confirmar] ";
