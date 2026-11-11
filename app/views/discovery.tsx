import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CloudOff, FileText, LoaderCircle, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { defaultLearningNote, learningNotes } from "@/config/learning-notes";
import { phases } from "@/config/phases";
import { tracks } from "@/config/tracks";
import { discoveryCoverage, phaseQuestions } from "@/lib/discovery-rules";
import { saveDiscovery, type DiscoveryDraft } from "@/lib/local-discoveries";
import { buildDiscoverySummary } from "@/lib/qualification";
import { AiAssistant, type AiApply } from "../components/ai-assistant";
import { C4MiniMap } from "../components/c4-mini-map";
import { CopyButton } from "../components/copy-button";
import { InsightsCard } from "../components/insights-card";
import { PageHeader } from "../components/page-header";
import { QuestionField } from "../components/question-field";
import { toggleId, TrackPicker } from "../components/track-picker";

type SaveState = { kind: "idle" | "pending" | "saved" | "error"; at?: string };

/** Salva no navegador ~1s depois da última edição, sempre que houver nome. */
function useAutosave(draft: DiscoveryDraft, onChange: (draft: DiscoveryDraft) => void) {
  const signature = useMemo(
    () => JSON.stringify([draft.title, draft.outcome, draft.problem, draft.tracks, draft.answers, draft.insights]),
    [draft.title, draft.outcome, draft.problem, draft.tracks, draft.answers, draft.insights],
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
  if (!hasTitle) return <span className="text-xs text-[#8a98a9]">Dê um nome para salvar automaticamente</span>;
  if (state.kind === "pending")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-[#718196]">
        <LoaderCircle className="size-3.5 animate-spin" /> Salvando…
      </span>
    );
  if (state.kind === "error")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-[#b53d4a]">
        <CloudOff className="size-3.5" /> Não foi possível salvar neste navegador
      </span>
    );
  if (state.kind === "saved")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-[#45806b]">
        <Check className="size-3.5" /> Salvo neste navegador
        {state.at && ` às ${new Date(state.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
      </span>
    );
  return null;
}

export function DiscoveryView({
  draft,
  onChange,
  onNew,
}: {
  draft: DiscoveryDraft;
  onChange: (draft: DiscoveryDraft) => void;
  onNew: () => void;
}) {
  const [phase, setPhase] = useState<string>("asis");
  const saveState = useAutosave(draft, onChange);
  const selected = tracks.filter((track) => draft.tracks.includes(track.id));
  const trackQuestions = selected.flatMap((track) => track.questions.map((question) => ({ track, question })));
  const allQuestions = [...trackQuestions.map(({ question }) => question), ...Object.values(phaseQuestions)];
  const coverage = discoveryCoverage(allQuestions, draft.answers);
  const summary = () => buildDiscoverySummary(draft, tracks, [...phases], phaseQuestions);

  const updateField = (field: "title" | "outcome" | "problem", value: string) => onChange({ ...draft, [field]: value });
  const updateAnswer = (question: string, value: string) =>
    onChange({ ...draft, answers: { ...draft.answers, [question]: value } });

  const applyAi = ({ addTracks, answers, insights }: AiApply) =>
    onChange({
      ...draft,
      tracks: [...new Set([...draft.tracks, ...addTracks])],
      answers: { ...answers, ...Object.fromEntries(Object.entries(draft.answers).filter(([, value]) => value.trim())) },
      insights,
    });

  const aiButton = (
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
        ],
        answers: draft.answers,
      })}
      onApply={applyAi}
      trigger={(open) => (
        <Button onClick={open} className="w-full bg-[#7c3aed] hover:bg-[#6d28d9]">
          <Sparkles /> Analisar com IA
        </Button>
      )}
    />
  );

  return (
    <>
      <PageHeader
        eyebrow="Workspace guiado"
        title={draft.title.trim() || "Novo discovery"}
        description="Defina o contexto, selecione as frentes e deixe o roteiro se adaptar. Nada vira fato confirmado sem uma resposta explícita."
        actions={
          <>
            <SaveIndicator state={saveState} hasTitle={!!draft.title.trim()} />
            <Button variant="outline" size="sm" className="border-[#c9d6e3] text-[#52657d]" onClick={onNew}>
              <Plus /> Novo
            </Button>
          </>
        }
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            <Card className="gap-5 border-[#dce3eb] py-5 shadow-none">
              <CardHeader className="px-5 md:px-6">
                <CardTitle className="text-lg text-[#17283f]">Contexto inicial</CardTitle>
                <CardDescription className="mt-2">O suficiente para orientar a descoberta, não para fingir que o escopo já existe.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 px-5 md:grid-cols-2 md:px-6">
                <label className="space-y-2 text-xs font-medium text-[#52657d]">
                  Cliente ou oportunidade
                  <Input
                    value={draft.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    placeholder="Ex.: Modernização da plataforma"
                    className="h-10 bg-[#fbfcfd]"
                  />
                </label>
                <label className="space-y-2 text-xs font-medium text-[#52657d]">
                  Resultado esperado
                  <Input
                    value={draft.outcome}
                    onChange={(event) => updateField("outcome", event.target.value)}
                    placeholder="Ex.: Reduzir risco e preparar migração"
                    className="h-10 bg-[#fbfcfd]"
                  />
                </label>
                <label className="space-y-2 text-xs font-medium text-[#52657d] md:col-span-2">
                  Problema que disparou o discovery
                  <Textarea
                    value={draft.problem}
                    onChange={(event) => updateField("problem", event.target.value)}
                    placeholder="Descreva a cena, a dor e por que isso precisa mudar agora. Pode colar notas de reunião."
                    className="min-h-24 resize-y bg-[#fbfcfd]"
                  />
                </label>
              </CardContent>
            </Card>

            {draft.insights && <InsightsCard insights={draft.insights} onClear={() => onChange({ ...draft, insights: undefined })} />}

            <Card className="gap-5 border-[#dce3eb] py-5 shadow-none">
              <CardHeader className="px-5 md:px-6">
                <CardTitle className="text-lg text-[#17283f]">Quais frentes participam?</CardTitle>
                <CardDescription>Combine trilhas. As perguntas de cada uma aparecem na fase AS-IS.</CardDescription>
              </CardHeader>
              <CardContent className="px-5 md:px-6">
                <TrackPicker selected={draft.tracks} onToggle={(id) => onChange({ ...draft, tracks: toggleId(draft.tracks, id) })} />
              </CardContent>
            </Card>

            <Tabs value={phase} onValueChange={setPhase}>
              <div className="overflow-x-auto pb-1">
                <TabsList variant="line" className="min-w-max border-b border-[#dfe6ed]">
                  {phases.map((item) => {
                    const questions = item.id === "asis" ? trackQuestions.map(({ question }) => question) : [phaseQuestions[item.id]];
                    const done = questions.length > 0 && questions.every((question) => draft.answers[question]?.trim());
                    return (
                      <TabsTrigger key={item.id} value={item.id} className="px-4 py-3">
                        {item.name}
                        {done && <Check className="size-3.5 text-[#2f9a6c]" />}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
              {phases.map((item) => {
                const items =
                  item.id === "asis"
                    ? trackQuestions.map(({ track, question }) => ({ badge: track.name, question }))
                    : [{ badge: "Transversal", question: phaseQuestions[item.id] }];
                return (
                  <TabsContent key={item.id} value={item.id} className="mt-4">
                    <Card className="gap-0 overflow-hidden border-[#dce3eb] py-0 shadow-none">
                      <div className="border-b border-[#e1e7ed] bg-[#f7f9fb] px-5 py-4 md:px-6">
                        <div className="flex items-center gap-3">
                          <div className="grid size-9 place-items-center rounded-xl bg-[#e4f1ff] text-[#337fca]">
                            <item.icon className="size-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#1d3048]">
                              {item.name}: {item.subtitle}
                            </p>
                            <p className="text-xs text-[#75849a]">{item.guide}</p>
                          </div>
                        </div>
                      </div>
                      {items.length ? (
                        <div className="divide-y divide-[#e5eaf0]">
                          {items.map(({ badge, question }, index) => (
                            <QuestionField
                              key={question}
                              index={index}
                              question={question}
                              badge={badge}
                              value={draft.answers[question] ?? ""}
                              onChange={(value) => updateAnswer(question, value)}
                              placeholder="Registre fato, fonte e contexto. Se não souber, marque como lacuna."
                              note={learningNotes[question] ?? defaultLearningNote(item.name)}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="p-6 text-sm text-[#718196]">Selecione ao menos uma trilha para ver as perguntas do AS-IS.</p>
                      )}
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <Card className="gap-4 border-[#1f3550] bg-[#0e1b2b] py-5 text-white shadow-none">
              <CardHeader className="px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Cobertura do discovery</CardTitle>
                  <span className="font-mono text-xs text-[#78b8f6]">{coverage.percent}%</span>
                </div>
              </CardHeader>
              <CardContent className="px-5">
                <Progress value={coverage.percent} className="bg-[#22364e] [&_[data-slot=progress-indicator]]:bg-[#53d8a0]" />
                <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-[#75879d]">Trilhas</p>
                    <p className="mt-1 text-xl font-semibold">{selected.length}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-[#75879d]">Respondidas</p>
                    <p className="mt-1 text-xl font-semibold">
                      {coverage.answered}/{coverage.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gap-3 border-[#dce3eb] py-5 shadow-none">
              <CardHeader className="px-5">
                <CardTitle className="text-sm text-[#1d3048]">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-5">
                {aiButton}
                <CopyButton value={summary} variant="outline" icon={<FileText />} copiedLabel="Resumo copiado" className="w-full border-[#9abbd8] text-[#17395d]">
                  Copiar resumo do discovery
                </CopyButton>
                <p className="pt-1 text-[11px] leading-5 text-[#8a98a9]">
                  A IA sugere trilhas, preenche lacunas com base no material e propõe perguntas e frentes. Você revisa antes de aplicar.
                </p>
              </CardContent>
            </Card>

            <C4MiniMap selected={selected} />

            <Card className="gap-3 border-[#dce3eb] py-5 shadow-none">
              <CardHeader className="px-5">
                <CardTitle className="text-sm text-[#1d3048]">Próxima lacuna relevante</CardTitle>
              </CardHeader>
              <CardContent className="px-5 text-xs leading-5 text-[#6d7d92]">
                {coverage.missing[0] ?? "Todas as perguntas aplicáveis foram preenchidas. Revise as evidências antes de avançar."}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
