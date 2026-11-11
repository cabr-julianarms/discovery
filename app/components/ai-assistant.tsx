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
} from "@/lib/ai-assist";
import { CopyButton } from "./copy-button";

export type AiApply = { addTracks: string[]; answers: Record<string, string>; insights: AiInsights };

const assistants = [
  { name: "ChatGPT", url: "https://chatgpt.com/" },
  { name: "Gemini", url: "https://gemini.google.com/app" },
];

const confidenceStyle = {
  alta: "bg-[#dff3e9] text-[#26694b]",
  media: "bg-[#eef3f8] text-[#4d6177]",
  baixa: "bg-[#fff1e3] text-[#9a5a12]",
} as const;

function Step({ number, title, done, children }: { number: number; title: string; done?: boolean; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#e1e7ed] bg-white p-4 md:p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-[#1d3048]">
        <span
          className={`grid size-6 place-items-center rounded-full font-mono text-[11px] ${done ? "bg-[#53d8a0] text-[#07261a]" : "bg-[#17395d] text-white"}`}
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
    onApply({ addTracks: pickedTracks, answers, insights: result.insights });
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
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto bg-[#f4f6f8] p-0 sm:max-w-2xl">
          <SheetHeader className="border-b border-[#e1e7ed] bg-white p-5">
            <SheetTitle className="flex items-center gap-2 text-[#17283f]">
              <Sparkles className="size-5 text-[#8b5cf6]" /> Analisar com IA
            </SheetTitle>
            <SheetDescription>
              Sem chave de API: você usa o assistente de IA que já tem. O site prepara o pedido e depois lê a resposta.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 p-5">
            <Step number={1} title="Copie o pedido e cole no assistente de IA" done={!!response}>
              <div className="flex flex-wrap gap-2">
                <CopyButton value={prompt} className="bg-[#17395d] hover:bg-[#234d78]" copiedLabel="Pedido copiado">
                  Copiar pedido
                </CopyButton>
                {assistants.map((assistant) => (
                  <Button key={assistant.name} asChild variant="outline" className="border-[#c9d6e3] text-[#17395d]">
                    <a href={assistant.url} target="_blank" rel="noreferrer">
                      Abrir {assistant.name} <ExternalLink />
                    </a>
                  </Button>
                ))}
              </div>
              <p className="mt-3 flex gap-2 rounded-xl bg-[#eef6ff] p-3 text-xs leading-5 text-[#3f5d7a]">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#337fca]" />
                Use a conta de IA aprovada pela empresa para dados de cliente. E-mails e telefones são removidos do pedido automaticamente; nomes e outros dados, não.
              </p>
              <details className="mt-3 text-xs text-[#607087]">
                <summary className="cursor-pointer font-medium text-[#337fca]">
                  Ver o pedido ({prompt.length.toLocaleString("pt-BR")} caracteres)
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-[#e1e7ed] bg-[#fbfcfd] p-3 font-mono text-[11px] leading-5">
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
                className="min-h-32 resize-y bg-[#fbfcfd] font-mono text-xs"
              />
              <Button onClick={read} disabled={!response.trim()} className="mt-3 bg-[#17395d] hover:bg-[#234d78]">
                Ler resposta <ArrowRight />
              </Button>
              {error && (
                <p className="mt-3 flex gap-2 rounded-xl border border-[#edc9ce] bg-[#fff7f8] p-3 text-xs leading-5 text-[#a04450]">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
                </p>
              )}
            </Step>

            {result && input && (
              <Step number={3} title="Revise o que vai entrar">
                {result.insights.summary && (
                  <p className="rounded-xl bg-[#f7f2ff] p-3 text-sm leading-6 text-[#3f3357]">{result.insights.summary}</p>
                )}

                {(newTracks.length > 0 || keptTracks.length > 0) && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#7a899c]">Trilhas</p>
                    <div className="mt-2 space-y-2">
                      {newTracks.map((track) => (
                        <label key={track.id} className="flex cursor-pointer gap-3 rounded-xl border border-[#e1e7ed] p-3">
                          <Checkbox
                            checked={pickedTracks.includes(track.id)}
                            onCheckedChange={() => setPickedTracks(toggle(pickedTracks, track.id))}
                            className="mt-0.5"
                          />
                          <span className="text-sm">
                            <span className="font-semibold text-[#23344b]">Adicionar {trackName(track.id)}</span>{" "}
                            <Badge className={`ml-1 text-[10px] ${confidenceStyle[track.confidence]}`}>confiança {track.confidence}</Badge>
                            {track.reason && <span className="mt-1 block text-xs leading-5 text-[#718196]">{track.reason}</span>}
                          </span>
                        </label>
                      ))}
                      {keptTracks.map((track) => (
                        <p key={track.id} className="rounded-xl bg-[#f7f9fb] p-3 text-xs leading-5 text-[#718196]">
                          <span className="font-semibold text-[#53667e]">{trackName(track.id)}</span> já estava marcada. {track.reason}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {result.answers.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#7a899c]">
                      Respostas encontradas no material
                    </p>
                    <div className="mt-2 space-y-2">
                      {result.answers.map((answer) => (
                        <label key={answer.question} className="flex cursor-pointer gap-3 rounded-xl border border-[#e1e7ed] p-3">
                          <Checkbox
                            checked={pickedAnswers.includes(answer.question)}
                            onCheckedChange={() => setPickedAnswers(toggle(pickedAnswers, answer.question))}
                            className="mt-0.5"
                          />
                          <span className="min-w-0 text-xs leading-5 text-[#607087]">
                            <span className="block font-medium text-[#53667e]">{answer.question}</span>
                            <span className="mt-1 block text-sm text-[#23344b]">{answer.answer}</span>
                            {answer.evidence && <span className="mt-1 block italic">“{answer.evidence}”</span>}
                            {answer.inferred && (
                              <Badge className="mt-2 bg-[#fff4d6] text-[10px] text-[#8a6100]">
                                Dedução da IA · entra marcada como “A confirmar”
                              </Badge>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-dashed border-[#d9c8f5] bg-[#fbf8ff] p-3 text-xs leading-5 text-[#5d4f75]">
                  Também serão guardados: {result.insights.clientQuestions.length} pergunta(s) para o cliente,{" "}
                  {result.insights.opportunities.length} frente(s) a explorar e {result.insights.risks.length} risco(s).
                  Eles aparecem no card “Sugestões da IA” e entram nos textos de CRM e handoff.
                </div>

                {result.warnings.length > 0 && (
                  <details className="mt-3 text-xs text-[#8a6100]">
                    <summary className="cursor-pointer">{result.warnings.length} item(ns) ignorado(s)</summary>
                    <ul className="mt-2 list-disc pl-5">
                      {result.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </details>
                )}

                <Button onClick={apply} className="mt-4 w-full bg-[#7c3aed] hover:bg-[#6d28d9]">
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
