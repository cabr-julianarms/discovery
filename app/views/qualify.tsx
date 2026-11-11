import { ArrowRight, ClipboardPaste, RotateCcw, SearchCheck, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { tracks } from "@/config/tracks";
import { detectTrackIds } from "@/lib/discovery-rules";
import type { DiscoveryDraft } from "@/lib/local-discoveries";
import {
  assessQualification,
  buildCrmSummary,
  buildEngineeringHandoff,
  firstMeetingQuestions,
  sanitizeContext,
  type QualificationState,
} from "@/lib/qualification";
import { AiAssistant, type AiApply } from "../components/ai-assistant";
import { CopyButton } from "../components/copy-button";
import { InsightsCard } from "../components/insights-card";
import { PageHeader } from "../components/page-header";
import { QuestionField } from "../components/question-field";
import { toggleId, TrackPicker } from "../components/track-picker";

export function QualifyView({
  state,
  onChange,
  onReset,
  onStartDiscovery,
}: {
  state: QualificationState;
  onChange: (state: QualificationState) => void;
  onReset: () => void;
  onStartDiscovery: (draft: DiscoveryDraft) => void;
}) {
  const a = assessQualification(state, tracks);
  const crmOutput = buildCrmSummary(state, tracks);
  const engineeringOutput = buildEngineeringHandoff(state, tracks);
  const setAnswer = (question: string, value: string) =>
    onChange({ ...state, answers: { ...state.answers, [question]: value } });

  const identify = () => {
    const allKnownContext = [state.context, ...firstMeetingQuestions.map((question) => state.answers[question] ?? "")].join("\n");
    const detected = detectTrackIds(allKnownContext, tracks);
    onChange({ ...state, selectedTracks: [...new Set([...state.selectedTracks, ...detected])], analyzed: true });
  };

  const applyAi = ({ addTracks, answers, insights }: AiApply) =>
    onChange({
      ...state,
      analyzed: true,
      selectedTracks: [...new Set([...state.selectedTracks, ...addTracks])],
      answers: { ...answers, ...Object.fromEntries(Object.entries(state.answers).filter(([, value]) => value.trim())) },
      insights,
    });

  const beginTechnicalDiscovery = () =>
    onStartDiscovery({
      title: a.company || "Oportunidade qualificada",
      outcome: state.answers[firstMeetingQuestions[0]]?.trim() || "Aprofundar a oportunidade com o especialista adequado",
      problem: sanitizeContext(
        state.context.trim() ||
          firstMeetingQuestions
            .filter((question) => state.answers[question]?.trim())
            .map((question) => `${question}\n${state.answers[question].trim()}`)
            .join("\n\n"),
      ).slice(0, 6000),
      tracks: state.selectedTracks,
      answers: state.answers,
      insights: state.insights,
      status: "draft",
    });

  const hasWork = !!(state.context.trim() || Object.values(state.answers).some((value) => value.trim()));

  return (
    <>
      <PageHeader
        eyebrow="Pré-discovery comercial"
        title="Qualificar oportunidade"
        description="Comece com o que você tiver — BANT, e-mail, notas ou nada ainda — e termine a primeira conversa com um encaminhamento sempre igual."
        actions={
          hasWork && (
            <Button
              variant="outline"
              size="sm"
              className="border-line-strong text-ink-soft"
              onClick={() => window.confirm("Começar uma nova qualificação? O conteúdo atual desta tela será apagado.") && onReset()}
            >
              <RotateCcw /> Nova qualificação
            </Button>
          )
        }
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5">
            <Card className="gap-5 border-line py-5 shadow-none">
              <CardHeader className="px-5 md:px-6">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                    <ClipboardPaste className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-ink">Comece com o que você já sabe</CardTitle>
                    <CardDescription className="mt-2">
                      Cole qualquer contexto disponível. Se ainda não houver material, comece sem ele e use as cinco perguntas padrão.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 md:px-6">
                <Textarea
                  value={state.context}
                  onChange={(event) => onChange({ ...state, context: event.target.value })}
                  placeholder="Cole um BANT, e-mail, Take Notes, mensagem do cliente ou suas anotações. Este campo é opcional."
                  className="min-h-44 resize-y bg-surface-2 text-sm leading-6"
                />
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button onClick={identify} className="bg-action hover:bg-action-hover">
                    <SearchCheck /> {state.context.trim() ? "Identificar trilhas" : "Começar sem contexto"}
                  </Button>
                  <AiAssistant
                    applyLabel="Aplicar na qualificação"
                    buildInput={() => ({
                      mode: "qualificacao",
                      context: state.context,
                      catalog: tracks,
                      selectedTracks: state.selectedTracks,
                      questions: [
                        ...firstMeetingQuestions.map((text) => ({ text, group: "Primeira conversa" })),
                        ...tracks.flatMap((track) => track.qualificationQuestions.map((text) => ({ text, group: track.name }))),
                      ],
                      answers: state.answers,
                    })}
                    onApply={applyAi}
                    trigger={(open) => (
                      <Button onClick={open} variant="outline" className="border-ai-line bg-ai-soft text-ai hover:bg-ai-soft">
                        <Sparkles /> Analisar com IA
                      </Button>
                    )}
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-ink-muted">
                  <strong className="font-medium text-ink-soft">Identificar trilhas</strong> usa palavras-chave e roda no navegador.{" "}
                  <strong className="font-medium text-ink-soft">Analisar com IA</strong> também preenche lacunas e sugere perguntas e frentes, usando o assistente de IA que você já tem.
                </p>
              </CardContent>
            </Card>

            {state.insights && <InsightsCard insights={state.insights} onClear={() => onChange({ ...state, insights: undefined })} />}

            {state.analyzed && (
              <Card className="gap-0 overflow-hidden border-brand-line py-0 shadow-none">
                <div className="border-b border-brand-line bg-brand-soft px-5 py-4 md:px-6">
                  <p className="font-semibold text-ink">As cinco perguntas de toda primeira conversa</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    A ordem não muda. Registre o que souber e use “não sabe” quando essa for a resposta real.
                  </p>
                </div>
                <div className="divide-y divide-line">
                  {firstMeetingQuestions.map((question, index) => (
                    <QuestionField
                      key={question}
                      index={index}
                      question={question}
                      value={state.answers[question] ?? ""}
                      onChange={(value) => setAnswer(question, value)}
                      placeholder="Resposta do cliente ou “não sabe”."
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-line bg-surface-2 px-5 py-4 md:px-6">
                  <span className="text-xs text-ink-muted">{a.firstMeetingAnswered}/5 respostas registradas</span>
                  <Button onClick={identify} variant="outline" className="border-line-strong text-action">
                    <SearchCheck /> Atualizar trilhas
                  </Button>
                </div>
              </Card>
            )}

            {state.analyzed && (
              <Card className="gap-5 border-line py-5 shadow-none">
                <CardHeader className="px-5 md:px-6">
                  <CardTitle className="text-lg text-ink">Confirme as frentes da oportunidade</CardTitle>
                  <CardDescription>
                    As sugestões vêm de todo o contexto registrado. Marque ou desmarque o que fizer sentido antes de avançar.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-5 md:px-6">
                  <TrackPicker
                    selected={state.selectedTracks}
                    onToggle={(id) => onChange({ ...state, selectedTracks: toggleId(state.selectedTracks, id) })}
                  />
                </CardContent>
              </Card>
            )}

            {a.selected.length > 0 && (
              <Card className="gap-0 overflow-hidden border-line py-0 shadow-none">
                <div className="border-b border-line bg-surface-2 px-5 py-4 md:px-6">
                  <p className="font-semibold text-ink">Roteiro da primeira reunião</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Perguntas repetíveis para coletar contexto, não para fechar arquitetura ou escopo.
                  </p>
                </div>
                <div className="divide-y divide-line">
                  {a.questions.map(({ track, question }, index) => (
                    <QuestionField
                      key={`${track.id}-${question}`}
                      index={index}
                      question={question}
                      badge={track.name}
                      value={state.answers[question] ?? ""}
                      onChange={(value) => setAnswer(question, value)}
                      placeholder="Registre a resposta do cliente ou escreva “não sabe”."
                    />
                  ))}
                </div>
              </Card>
            )}

            {state.analyzed && (
              <Card className="gap-0 overflow-hidden border-success-line py-0 shadow-none">
                <div className="border-b border-success-line bg-success-soft px-5 py-5 md:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-success">Saída padrão da primeira reunião</p>
                      <p className="mt-1 text-lg font-semibold text-success-ink">Sempre os mesmos blocos. Sempre uma próxima ação.</p>
                    </div>
                    <Badge className="bg-success-soft text-success">{a.maturity}</Badge>
                  </div>
                </div>
                <CardContent className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
                  <div className="rounded-2xl border border-line bg-white p-4">
                    <p className="text-sm font-semibold text-ink">Resumo para o CRM</p>
                    <p className="mt-2 text-xs leading-5 text-ink-muted">
                      Objetivo, cenário, pessoas, tecnologia, prazo, lacunas, sugestões da IA e encaminhamento, em ordem fixa.
                    </p>
                    <CopyButton value={crmOutput} copiedLabel="Resumo copiado" icon={<ClipboardPaste />} className="mt-4 w-full">
                      Copiar resumo para CRM
                    </CopyButton>
                  </div>
                  <div className="rounded-2xl border border-line bg-white p-4">
                    <p className="text-sm font-semibold text-ink">Handoff para Engenharia</p>
                    <p className="mt-2 text-xs leading-5 text-ink-muted">
                      Entrega contexto, respostas técnicas e expectativa da próxima conversa sem recomeçar do zero.
                    </p>
                    <CopyButton
                      value={engineeringOutput}
                      copiedLabel="Handoff copiado"
                      icon={<Users />}
                      disabled={!a.selected.length}
                      variant="outline"
                      className="mt-4 w-full border-line-strong text-action"
                    >
                      Copiar handoff técnico
                    </CopyButton>
                  </div>
                  <details className="rounded-2xl border border-line bg-white p-4 text-xs md:col-span-2">
                    <summary className="cursor-pointer font-medium text-brand">Pré-visualizar o resumo para CRM</summary>
                    <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-5 text-ink-soft">{crmOutput}</pre>
                  </details>
                  <div className="rounded-2xl bg-navy p-4 text-white md:col-span-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-mint">Próxima ação recomendada</p>
                    <p className="mt-2 text-sm leading-6 text-navy-text">{a.nextAction}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <Card className="gap-4 border-navy-line bg-navy py-5 text-white shadow-none">
              <CardHeader className="px-5">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-mint" />
                  <CardTitle className="text-sm">Quem chamar</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-5">
                {a.selected.length ? (
                  a.selected.map((track) => (
                    <div key={track.id} className="rounded-xl bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-[.14em] text-navy-muted">{track.name}</p>
                      <p className="mt-1 text-sm font-medium text-navy-text">{track.specialist}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs leading-5 text-navy-muted">
                    Registre o contexto ou comece pelas cinco perguntas para receber a indicação.
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="gap-3 border-line py-5 shadow-none">
              <CardHeader className="px-5">
                <CardTitle className="text-sm text-ink">Preparar o próximo passo</CardTitle>
              </CardHeader>
              <CardContent className="px-5 text-xs leading-5 text-ink-muted">
                {a.nextAction} “Não sei” é uma resposta válida: ela vira uma lacuna explícita, não uma informação inventada.
                <Button
                  onClick={beginTechnicalDiscovery}
                  disabled={!a.selected.length || !a.technicalAnswered}
                  className="mt-4 w-full"
                >
                  Levar para discovery técnico <ArrowRight />
                </Button>
                {(!a.selected.length || !a.technicalAnswered) && (
                  <p className="mt-2 text-[11px] text-ink-faint">Libera quando houver ao menos uma trilha marcada e uma pergunta da trilha respondida.</p>
                )}
                <p className="mt-3 text-[11px] text-ink-faint">Esta tela é salva automaticamente neste navegador.</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
