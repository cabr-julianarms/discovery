import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CloudOff, FileText, Layers, LoaderCircle, Plus, Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { migrationStrategies, pillarQuestions, pillars } from "@/config/frameworks";
import { defaultLearningNote, learningNotes } from "@/config/learning-notes";
import { phases } from "@/config/phases";
import { tracks } from "@/config/tracks";
import { discoveryCoverage, phaseQuestions } from "@/lib/discovery-rules";
import { mergeWorkloads, saveDiscovery, type DiscoveryDraft } from "@/lib/local-discoveries";
import { buildDiscoverySummary } from "@/lib/qualification";
import { AiAssistant, type AiApply } from "../components/ai-assistant";
import { C4MiniMap } from "../components/c4-mini-map";
import { CopyButton } from "../components/copy-button";
import { InsightsCard } from "../components/insights-card";
import { PageHeader, SectionHeader } from "../components/page-header";
import { QuestionField } from "../components/question-field";
import { toggleId, TrackPicker } from "../components/track-picker";
import { WorkloadTable } from "../components/workload-table";

type SaveState = { kind: "idle" | "pending" | "saved" | "error"; at?: string };

/** Salva no navegador ~1s depois da última edição, sempre que houver nome. */
function useAutosave(draft: DiscoveryDraft, onChange: (draft: DiscoveryDraft) => void) {
  const signature = useMemo(
    () => JSON.stringify([draft.title, draft.outcome, draft.problem, draft.tracks, draft.answers, draft.insights, draft.workloads]),
    [draft.title, draft.outcome, draft.problem, draft.tracks, draft.answers, draft.insights, draft.workloads],
  );
  const lastSaved = useRef(draft.id ? signature : "");
  const [state, setState] = useState<SaveState>({ kind: draft.id ? "saved" : "idle", at: draft.updated_at });

  useEffect(() => {
    if (!draft.title.trim() || signature === lastSaved.current) return;
    setState({ kind: "pending" });
    const timer = window.setTimeout(() => {
      try {
        const saved = saveDiscovery(window.localStorage, draft);
        lastSaved.current = signature;
        setState({ kind: "saved", at: saved.updated_at });
        if (!draft.id) onChange({ ...draft, id: saved.id, created_at: saved.created_at, updated_at: saved.updated_at });
      } catch {
        setState({ kind: "error" });
      }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [signature]); // a assinatura cobre todo o conteúdo que importa salvar

  return state;
}

function SaveIndicator({ state, hasTitle }: { state: SaveState; hasTitle: boolean }) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs";
  if (!hasTitle) return <span className={`${base} bg-surface-2 text-ink-faint`}>Dê um nome para salvar</span>;
  if (state.kind === "pending")
    return (
      <span className={`${base} bg-surface-2 text-ink-muted`}>
        <LoaderCircle className="size-3.5 animate-spin" /> Salvando…
      </span>
    );
  if (state.kind === "error")
    return (
      <span className={`${base} bg-danger-soft text-danger`}>
        <CloudOff className="size-3.5" /> Não foi possível salvar
      </span>
    );
  if (state.kind === "saved")
    return (
      <span className={`${base} bg-success-soft text-success`}>
        <Check className="size-3.5" /> Salvo
        {state.at && ` às ${new Date(state.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
      </span>
    );
  return null;
}

type Step = {
  id: string;
  name: string;
  subtitle: string;
  guide: string;
  icon: typeof Layers;
  questions: { badge: string; question: string }[];
  kind: "phase" | "framework";
};

export function DiscoveryView({
  draft,
  onChange,
  onNew,
}: {
  draft: DiscoveryDraft;
  onChange: (draft: DiscoveryDraft) => void;
  onNew: () => void;
}) {
  const [stepId, setStepId] = useState<string>("asis");
  const saveState = useAutosave(draft, onChange);
  const selected = tracks.filter((track) => draft.tracks.includes(track.id));
  const hasMigration = draft.tracks.includes("migration");
  const workloads = draft.workloads ?? [];
  const trackQuestions = selected.flatMap((track) => track.questions.map((question) => ({ badge: track.name, question })));

  const steps: Step[] = [
    ...phases.map((phase) => ({
      id: phase.id,
      name: phase.name,
      subtitle: phase.subtitle,
      guide: phase.guide,
      icon: phase.icon,
      kind: "phase" as const,
      questions: phase.id === "asis" ? trackQuestions : [{ badge: "Transversal", question: phaseQuestions[phase.id] }],
    })),
    {
      id: "pillars",
      name: "Pilares",
      subtitle: "Google Cloud Architecture Framework",
      guide: "Requisitos não funcionais que valem para qualquer trilha: operação, segurança, confiabilidade, custo e desempenho.",
      icon: Layers,
      kind: "framework",
      questions: pillars.map((pillar) => ({ badge: pillar.name, question: pillar.question })),
    },
    ...(hasMigration
      ? [
          {
            id: "workloads",
            name: "Workloads",
            subtitle: "Estratégia de migração (7 Rs)",
            guide: "Decida o destino de cada sistema: desativar, manter, mover como está, ajustar ou reescrever.",
            icon: Shuffle,
            kind: "framework" as const,
            questions: [],
          },
        ]
      : []),
  ];
  const step = steps.find((item) => item.id === stepId) ?? steps[1];

  const allQuestions = [...trackQuestions.map(({ question }) => question), ...Object.values(phaseQuestions), ...pillarQuestions];
  const coverage = discoveryCoverage(allQuestions, draft.answers);
  const answeredIn = (item: Step) => item.questions.filter(({ question }) => draft.answers[question]?.trim()).length;
  const summary = () =>
    buildDiscoverySummary(draft, tracks, [...phases], phaseQuestions, { pillars, strategies: hasMigration ? migrationStrategies : [] });

  const updateField = (field: "title" | "outcome" | "problem", value: string) => onChange({ ...draft, [field]: value });
  const updateAnswer = (question: string, value: string) =>
    onChange({ ...draft, answers: { ...draft.answers, [question]: value } });

  const applyAi = ({ addTracks, answers, insights, workloads: suggested }: AiApply) =>
    onChange({
      ...draft,
      tracks: [...new Set([...draft.tracks, ...addTracks])],
      answers: { ...answers, ...Object.fromEntries(Object.entries(draft.answers).filter(([, value]) => value.trim())) },
      insights,
      workloads: suggested.length ? mergeWorkloads(workloads, suggested) : draft.workloads,
    });

  return (
    <>
      <PageHeader
        eyebrow="Discovery técnico"
        title={draft.title.trim() || "Novo discovery"}
        actions={
          <>
            <SaveIndicator state={saveState} hasTitle={!!draft.title.trim()} />
            <Button variant="outline" size="sm" onClick={onNew}>
              <Plus /> Novo
            </Button>
          </>
        }
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            <Card className="gap-5 border-line py-5 shadow-none">
              <CardHeader className="px-5 md:px-6">
                <CardTitle className="text-base text-ink">Contexto inicial</CardTitle>
                <CardDescription>O suficiente para orientar a descoberta, não para fingir que o escopo já existe.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 px-5 md:grid-cols-2 md:px-6">
                <label className="space-y-1.5 text-xs font-medium text-ink-soft">
                  Cliente ou oportunidade
                  <Input
                    value={draft.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    placeholder="Ex.: Modernização da plataforma"
                    className="h-10 bg-surface-2"
                  />
                </label>
                <label className="space-y-1.5 text-xs font-medium text-ink-soft">
                  Resultado esperado
                  <Input
                    value={draft.outcome}
                    onChange={(event) => updateField("outcome", event.target.value)}
                    placeholder="Ex.: Reduzir risco e preparar migração"
                    className="h-10 bg-surface-2"
                  />
                </label>
                <label className="space-y-1.5 text-xs font-medium text-ink-soft md:col-span-2">
                  Problema que disparou o discovery
                  <Textarea
                    value={draft.problem}
                    onChange={(event) => updateField("problem", event.target.value)}
                    placeholder="Descreva a cena, a dor e por que isso precisa mudar agora. Pode colar notas de reunião."
                    className="min-h-24 resize-y bg-surface-2"
                  />
                </label>
              </CardContent>
            </Card>

            {draft.insights && <InsightsCard insights={draft.insights} onClear={() => onChange({ ...draft, insights: undefined })} />}

            <Card className="gap-5 border-line py-5 shadow-none">
              <CardHeader className="px-5 md:px-6">
                <CardTitle className="text-base text-ink">Quais frentes participam?</CardTitle>
                <CardDescription>
                  Combine trilhas. As perguntas de cada uma aparecem em AS-IS; Migração também libera a aba Workloads.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 md:px-6">
                <TrackPicker selected={draft.tracks} onToggle={(id) => onChange({ ...draft, tracks: toggleId(draft.tracks, id) })} />
              </CardContent>
            </Card>

            <Card className="gap-0 overflow-hidden border-line py-0 shadow-none">
              <nav aria-label="Etapas do discovery" className="border-b border-line bg-white">
                <ol className="flex flex-wrap items-stretch px-2">
                  {steps.map((item, index) => {
                    const total = item.id === "workloads" ? workloads.length : item.questions.length;
                    const answered = item.id === "workloads" ? workloads.filter((row) => row.strategy).length : answeredIn(item);
                    const done = total > 0 && answered === total;
                    const active = item.id === step.id;
                    const firstFramework = item.kind === "framework" && steps[index - 1]?.kind === "phase";
                    return (
                      <li key={item.id} className="flex items-stretch">
                        {firstFramework && <span className="mx-2 my-3 w-px bg-line" aria-hidden />}
                        <button
                          type="button"
                          onClick={() => setStepId(item.id)}
                          aria-current={active ? "step" : undefined}
                          className={`relative flex items-center gap-2 px-3 py-3.5 text-sm transition ${active ? "font-semibold text-ink" : "text-ink-muted hover:text-ink"}`}
                        >
                          <span
                            className={`grid size-5 place-items-center rounded-full text-[10px] font-semibold ${done ? "bg-success text-white" : active ? "bg-action text-white" : "bg-surface-2 text-ink-faint ring-1 ring-line"}`}
                          >
                            {done ? <Check className="size-3" /> : item.kind === "phase" ? index + 1 : <item.icon className="size-3" />}
                          </span>
                          {item.name}
                          {total > 0 && (
                            <span className="text-[11px] font-normal tabular-nums text-ink-faint">
                              {answered}/{total}
                            </span>
                          )}
                          {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-action" />}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              <SectionHeader
                icon={<step.icon className="size-4" />}
                title={`${step.name}: ${step.subtitle}`}
                description={step.guide}
                tone={step.kind === "framework" ? "brand" : "neutral"}
              />

              {step.id === "workloads" ? (
                <WorkloadTable workloads={workloads} onChange={(rows) => onChange({ ...draft, workloads: rows })} />
              ) : step.questions.length ? (
                <div className="divide-y divide-line">
                  {step.questions.map(({ badge, question }, index) => (
                    <QuestionField
                      key={question}
                      index={index}
                      question={question}
                      badge={badge}
                      value={draft.answers[question] ?? ""}
                      onChange={(value) => updateAnswer(question, value)}
                      placeholder="Registre fato, fonte e contexto. Se não souber, marque como lacuna."
                      note={
                        learningNotes[question] ??
                        pillars.find((pillar) => pillar.question === question)?.note ??
                        defaultLearningNote(step.name)
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="p-6 text-sm text-ink-muted">Selecione ao menos uma trilha para ver as perguntas do AS-IS.</p>
              )}
            </Card>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <Card className="gap-4 border-navy-line bg-navy py-5 text-white shadow-none">
              <CardHeader className="px-5">
                <div className="flex items-baseline justify-between">
                  <CardTitle className="text-sm font-medium text-navy-text">Cobertura</CardTitle>
                  <span className="text-2xl font-semibold tabular-nums text-white">{coverage.percent}%</span>
                </div>
              </CardHeader>
              <CardContent className="px-5">
                <Progress value={coverage.percent} className="h-1.5 bg-navy-2 [&_[data-slot=progress-indicator]]:bg-mint" />
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  {[
                    ["Trilhas", selected.length],
                    ["Respostas", `${coverage.answered}/${coverage.total}`],
                    ["Workloads", hasMigration ? workloads.length : "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-navy-2 p-2.5">
                      <p className="text-[11px] text-navy-muted">{label}</p>
                      <p className="mt-0.5 text-base font-semibold tabular-nums">{value}</p>
                    </div>
                  ))}
                </div>
                {coverage.missing[0] && (
                  <p className="mt-4 border-t border-navy-line pt-3 text-xs leading-5 text-navy-text">
                    <span className="block text-[10px] font-semibold uppercase tracking-[.14em] text-mint">Próxima lacuna</span>
                    {coverage.missing[0]}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="gap-3 border-line py-5 shadow-none">
              <CardContent className="space-y-2 px-5">
                <AiAssistant
                  applyLabel="Aplicar no discovery"
                  buildInput={() => ({
                    mode: "discovery",
                    context: draft.problem,
                    fields: { "Cliente / oportunidade": draft.title, "Resultado esperado": draft.outcome },
                    catalog: tracks,
                    selectedTracks: draft.tracks,
                    questions: [
                      ...tracks.flatMap((track) => track.questions.map((text) => ({ text, group: `AS-IS · ${track.name}` }))),
                      ...phases
                        .filter((item) => phaseQuestions[item.id])
                        .map((item) => ({ text: phaseQuestions[item.id], group: item.name })),
                      ...pillars.map((pillar) => ({ text: pillar.question, group: `Pilar · ${pillar.name}` })),
                    ],
                    answers: draft.answers,
                    ...(hasMigration
                      ? { strategies: migrationStrategies, workloads: workloads.filter((item) => item.name.trim()) }
                      : {}),
                  })}
                  onApply={applyAi}
                  trigger={(open) => (
                    <Button onClick={open} className="w-full bg-ai hover:bg-ai-hover">
                      <Sparkles /> Analisar com IA
                    </Button>
                  )}
                />
                <CopyButton value={summary} variant="outline" icon={<FileText />} copiedLabel="Resumo copiado" className="w-full">
                  Copiar resumo do discovery
                </CopyButton>
                <p className="pt-1 text-[11px] leading-5 text-ink-faint">
                  A IA sugere trilhas, preenche lacunas{hasMigration ? ", propõe a estratégia de cada workload" : ""} e indica
                  perguntas e frentes. Você revisa antes de aplicar.
                </p>
              </CardContent>
            </Card>

            <C4MiniMap selected={selected} />
          </aside>
        </div>
      </div>
    </>
  );
}
