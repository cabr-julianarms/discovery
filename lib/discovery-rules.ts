export type SignalTrack = { id: string; signals: string[] };

export function normalizeSignal(value: string) {
  return ` ${value.toLocaleLowerCase("pt-BR").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9+#./-]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

export function detectTrackIds(text: string, catalog: SignalTrack[]) {
  const source = normalizeSignal(text);
  return catalog.filter(track => track.signals.some(signal =>
    signal.trim() && source.includes(normalizeSignal(signal))
  )).map(track => track.id);
}

export const phaseQuestions: Record<string, string> = {
  vision: "Qual mudança de negócio ou operação precisa ser viabilizada?",
  gaps: "O que impede o cenário atual de atender o resultado esperado?",
  tobe: "Quais capacidades precisam existir no cenário-alvo?",
  transition: "Quais dependências definem a ordem das ondas de mudança?",
  governance: "Quais decisões, responsáveis e critérios sustentarão a arquitetura?",
};

export function discoveryCoverage(questions: string[], answers: Record<string, string>) {
  const applicable = [...new Set(questions)];
  const missing = applicable.filter(question => !answers[question]?.trim());
  return {
    missing,
    total: applicable.length,
    answered: applicable.length - missing.length,
    percent: applicable.length ? Math.round(100 * (applicable.length - missing.length) / applicable.length) : 0,
  };
}
