import { useState, type ReactNode } from "react";
import { ArrowRight, ExternalLink, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  buildPrompt,
  INFERRED_PREFIX,
  parseAiResponse,
  type AiInsights,
  type AiPromptInput,
  type AiResult,
  type AiWorkload,
} from "@/lib/ai-assist";
import { CopyButton } from "./copy-button";

export type AiApply = { addTracks: string[]; answers: Record<string, string>; insights: AiInsights; workloads: AiWorkload[] };

const assistants = [
  { name: "ChatGPT", url: "https://chatgpt.com/" },
  { name: "Gemini", url: "https://gemini.google.com/app" },
];

const confidenceStyle = {
  alta: "bg-success-soft text-success",
  media: "bg-surface-2 text-ink-soft",
  baixa: "bg-warn-soft text-warn",
} as const;

function Step({ number, title, done, children }: { number: number; title: string; done?: boolean; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4 md:p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span
          className={`grid size-6 place-items-center rounded-full font-mono text-[11px] ${done ? "bg-mint text-navy" : "bg-action text-white"}`}
        >
          {number}
        </span>
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function AiAssistant({
  buildInput,
  onApply,
  applyLabel = "Aplicar",
  trigger,
}: {
  buildInput: () => AiPromptInput;
  onApply: (result: AiApply) => void;
  applyLabel?: string;
  trigger: (open: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState<AiPromptInput | null>(null);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState("");
  const [pickedTracks, setPickedTracks] = useState<string[]>([]);
  const [pickedAnswers, setPickedAnswers] = useState<string[]>([]);
  const [pickedWorkloads, setPickedWorkloads] = useState<string[]>([]);

  const start = () => {
    const snapshot = buildInput();
    setInput(snapshot);
    setPrompt(buildPrompt(snapshot));
    setResponse("");
    setResult(null);
    setError("");
    setOpen(true);
  };

  const read = () => {
    if (!input) return;
    try {
      const parsed = parseAiResponse(response, input);
      setResult(parsed);
      setError("");
      setPickedTracks(
        parsed.tracks
          .filter((track) => !input.selectedTracks.includes(track.id) && track.confidence !== "baixa")
          .map((track) => track.id),
      );
      setPickedAnswers(parsed.answers.filter((answer) => !answer.inferred).map((answer) => answer.question));
      setPickedWorkloads(parsed.workloads.map((workload) => workload.name));
    } catch (problem) {
      setResult(null);
      setError(problem instanceof Error ? problem.message : "Não foi possível ler a resposta.");
    }
  };

  const apply = () => {
    if (!result) return;
    const answers = Object.fromEntries(
      result.answers
        .filter((answer) => pickedAnswers.includes(answer.question))
        .map((answer) => [answer.question, (answer.inferred ? INFERRED_PREFIX : "") + answer.answer]),
    );
    onApply({
      addTracks: pickedTracks,
      answers,
      insights: result.insights,
      workloads: result.workloads.filter((workload) => pickedWorkloads.includes(workload.name)),
    });
    setOpen(false);
  };

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  const trackName = (id: string) => input?.catalog.find((track) => track.id === id)?.name ?? id;
  const newTracks = result?.tracks.filter((track) => !input?.selectedTracks.includes(track.id)) ?? [];
  const keptTracks = result?.tracks.filter((track) => input?.selectedTracks.includes(track.id)) ?? [];

  return (
    <>
      {trigger(start)}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto bg-canvas p-0 sm:max-w-2xl">
          <SheetHeader className="border-b border-line bg-white p-5">
            <SheetTitle className="flex items-center gap-2 text-ink">
              <Sparkles className="size-5 text-ai" /> Analisar com IA
            </SheetTitle>
            <SheetDescription>
              Sem chave de API: você usa o assistente de IA que já tem. O site prepara o pedido e depois lê a resposta.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 p-5">
            <Step number={1} title="Copie o pedido e cole no assistente de IA" done={!!response}>
              <div className="flex flex-wrap gap-2">
                <CopyButton value={prompt} className="bg-action hover:bg-action-hover" copiedLabel="Pedido copiado">
                  Copiar pedido
                </CopyButton>
                {assistants.map((assistant) => (
                  <Button key={assistant.name} asChild variant="outline" className="border-line-strong text-action">
                    <a href={assistant.url} target="_blank" rel="noreferrer">
                      Abrir {assistant.name} <ExternalLink />
                    </a>
                  </Button>
                ))}
              </div>
              <p className="mt-3 flex gap-2 rounded-xl bg-brand-soft p-3 text-xs leading-5 text-ink-soft">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
                Use a conta de IA aprovada pela empresa para dados de cliente. E-mails e telefones são removidos do pedido automaticamente; nomes e outros dados, não.
              </p>
              <details className="mt-3 text-xs text-ink-muted">
                <summary className="cursor-pointer font-medium text-brand">
                  Ver o pedido ({prompt.length.toLocaleString("pt-BR")} caracteres)
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-surface-2 p-3 font-mono text-[11px] leading-5">
                  {prompt}
                </pre>
              </details>
            </Step>

            <Step number={2} title="Cole aqui a resposta da IA" done={!!result}>
              <Textarea
                value={response}
                onChange={(event) => {
                  setResponse(event.target.value);
                  setError("");
                }}
                placeholder="Cole a resposta inteira, incluindo o bloco ```json"
                className="min-h-32 resize-y bg-surface-2 font-mono text-xs"
              />
              <Button onClick={read} disabled={!response.trim()} className="mt-3">
                Ler resposta <ArrowRight />
              </Button>
              {error && (
                <p className="mt-3 flex gap-2 rounded-xl border border-danger-line bg-danger-soft p-3 text-xs leading-5 text-danger">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
                </p>
              )}
            </Step>

            {result && input && (
              <Step number={3} title="Revise o que vai entrar">
                {result.insights.summary && (
                  <p className="rounded-xl bg-ai-soft p-3 text-sm leading-6 text-ai-ink">{result.insights.summary}</p>
                )}

                {(newTracks.length > 0 || keptTracks.length > 0) && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[.14em] text-ink-faint">Trilhas</p>
                    <div className="mt-2 space-y-2">
                      {newTracks.map((track) => (
                        <label key={track.id} className="flex cursor-pointer gap-3 rounded-xl border border-line p-3">
                          <Checkbox
                            checked={pickedTracks.includes(track.id)}
                            onCheckedChange={() => setPickedTracks(toggle(pickedTracks, track.id))}
                            className="mt-0.5"
                          />
                          <span className="text-sm">
                            <span className="font-semibold text-ink">Adicionar {trackName(track.id)}</span>{" "}
                            <Badge className={`ml-1 text-[10px] ${confidenceStyle[track.confidence]}`}>confiança {track.confidence}</Badge>
                            {track.reason && <span className="mt-1 block text-xs leading-5 text-ink-muted">{track.reason}</span>}
                          </span>
                        </label>
                      ))}
                      {keptTracks.map((track) => (
                        <p key={track.id} className="rounded-xl bg-surface-2 p-3 text-xs leading-5 text-ink-muted">
                          <span className="font-semibold text-ink-soft">{trackName(track.id)}</span> já estava marcada. {track.reason}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {result.answers.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[.14em] text-ink-faint">
                      Respostas encontradas no material
                    </p>
                    <div className="mt-2 space-y-2">
                      {result.answers.map((answer) => (
                        <label key={answer.question} className="flex cursor-pointer gap-3 rounded-xl border border-line p-3">
                          <Checkbox
                            checked={pickedAnswers.includes(answer.question)}
                            onCheckedChange={() => setPickedAnswers(toggle(pickedAnswers, answer.question))}
                            className="mt-0.5"
                          />
                          <span className="min-w-0 text-xs leading-5 text-ink-muted">
                            <span className="block font-medium text-ink-soft">{answer.question}</span>
                            <span className="mt-1 block text-sm text-ink">{answer.answer}</span>
                            {answer.evidence && <span className="mt-1 block italic">“{answer.evidence}”</span>}
                            {answer.inferred && (
                              <Badge className="mt-2 bg-warn-soft text-[10px] text-warn">
                                Dedução da IA · entra marcada como “A confirmar”
                              </Badge>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {result.workloads.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[.14em] text-ink-faint">Estratégia por workload (7 Rs)</p>
                    <div className="mt-2 space-y-2">
                      {result.workloads.map((workload) => {
                        const strategy = input.strategies?.find((item) => item.id === workload.strategy);
                        return (
                          <label key={workload.name} className="flex cursor-pointer gap-3 rounded-xl border border-line p-3">
                            <Checkbox
                              checked={pickedWorkloads.includes(workload.name)}
                              onCheckedChange={() => setPickedWorkloads(toggle(pickedWorkloads, workload.name))}
                              className="mt-0.5"
                            />
                            <span className="min-w-0 text-xs leading-5 text-ink-muted">
                              <span className="block text-sm text-ink">
                                <span className="font-semibold">{workload.name}</span> →{" "}
                                {strategy ? `${strategy.name} (${strategy.label})` : "a definir"}
                              </span>
                              {workload.note && <span className="mt-1 block">{workload.note}</span>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-dashed border-ai-line bg-ai-soft p-3 text-xs leading-5 text-ai-ink">
                  Também serão guardados: {result.insights.clientQuestions.length} pergunta(s) para o cliente,{" "}
                  {result.insights.opportunities.length} frente(s) a explorar e {result.insights.risks.length} risco(s).
                  Eles aparecem no card “Sugestões da IA” e entram nos textos de CRM e handoff.
                </div>

                {result.warnings.length > 0 && (
                  <details className="mt-3 text-xs text-warn">
                    <summary className="cursor-pointer">{result.warnings.length} item(ns) ignorado(s)</summary>
                    <ul className="mt-2 list-disc pl-5">
                      {result.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </details>
                )}

                <Button onClick={apply} className="mt-4 w-full bg-ai hover:bg-ai-hover">
                  <Sparkles /> {applyLabel}
                </Button>
              </Step>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
