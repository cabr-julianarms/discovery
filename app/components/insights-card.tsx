import { Lightbulb, MessageCircleQuestion, Sparkles, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tracks } from "@/config/tracks";
import type { AiInsights } from "@/lib/ai-assist";
import { CopyButton } from "./copy-button";

const trackName = (id: string) => tracks.find((track) => track.id === id)?.name;

export function InsightsCard({ insights, onClear }: { insights: AiInsights; onClear: () => void }) {
  const date = new Date(insights.generatedAt);
  const questionsText = insights.clientQuestions.map((item) => `- ${item.question}`).join("\n");
  return (
    <Card className="gap-0 overflow-hidden border-ai-line py-0 shadow-none">
      <CardHeader className="border-b border-ai-soft bg-ai-soft px-5 py-4 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base text-ai-ink">
            <Sparkles className="size-4 text-ai" /> Sugestões da IA
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={onClear} className="-my-1 text-ai-muted">
            <X /> Remover
          </Button>
        </div>
        <p className="text-xs text-ai-muted">
          Geradas em {isNaN(date.getTime()) ? "—" : date.toLocaleString("pt-BR")}. Entram nos textos de CRM e handoff. Revise antes de usar com o cliente.
        </p>
        {insights.summary && <p className="mt-3 text-sm leading-6 text-ai-ink">{insights.summary}</p>}
      </CardHeader>
      <CardContent className="grid gap-5 p-5 md:p-6 lg:grid-cols-2">
        {insights.clientQuestions.length > 0 && (
          <section className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <MessageCircleQuestion className="size-4 text-brand" /> Perguntar ao cliente
              </p>
              <CopyButton value={questionsText} size="sm" variant="outline" className="border-line-strong text-action">
                Copiar perguntas
              </CopyButton>
            </div>
            <ol className="mt-3 space-y-2">
              {insights.clientQuestions.map((item, index) => (
                <li key={index} className="rounded-xl border border-line bg-white p-3">
                  <p className="text-sm font-medium text-ink">
                    {index + 1}. {item.question}
                  </p>
                  {(item.reason || trackName(item.track)) && (
                    <p className="mt-1 text-xs leading-5 text-ink-muted">
                      {trackName(item.track) && <span className="font-medium text-ink-soft">{trackName(item.track)} · </span>}
                      {item.reason}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
        {insights.opportunities.length > 0 && (
          <section>
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Lightbulb className="size-4 text-warn" /> Frentes a explorar
            </p>
            <ul className="mt-3 space-y-2">
              {insights.opportunities.map((item, index) => (
                <li key={index} className="rounded-xl border border-warn-line bg-warn-soft p-3 text-xs leading-5 text-warn-ink">
                  <p className="text-sm font-semibold text-warn-ink">{item.title}</p>
                  <p className="mt-1">{item.description}</p>
                  {item.value && <p className="mt-1 text-warn">Valor: {item.value}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {insights.risks.length > 0 && (
          <section>
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <TriangleAlert className="size-4 text-danger" /> Riscos e pontos de atenção
            </p>
            <ul className="mt-3 space-y-2">
              {insights.risks.map((risk, index) => (
                <li key={index} className="rounded-xl border border-danger-line bg-danger-soft p-3 text-xs leading-5 text-danger">
                  {risk}
                </li>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
