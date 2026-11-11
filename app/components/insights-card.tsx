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
    <Card className="gap-0 overflow-hidden border-[#d9c8f5] py-0 shadow-none">
      <CardHeader className="border-b border-[#ebe2fa] bg-[#f7f2ff] px-5 py-4 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base text-[#3b2566]">
            <Sparkles className="size-4 text-[#8b5cf6]" /> Sugestões da IA
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={onClear} className="-my-1 text-[#7a6a95]">
            <X /> Remover
          </Button>
        </div>
        <p className="text-xs text-[#7a6a95]">
          Geradas em {isNaN(date.getTime()) ? "—" : date.toLocaleString("pt-BR")}. Entram nos textos de CRM e handoff. Revise antes de usar com o cliente.
        </p>
        {insights.summary && <p className="mt-3 text-sm leading-6 text-[#3f3357]">{insights.summary}</p>}
      </CardHeader>
      <CardContent className="grid gap-5 p-5 md:p-6 lg:grid-cols-2">
        {insights.clientQuestions.length > 0 && (
          <section className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#24364e]">
                <MessageCircleQuestion className="size-4 text-[#337fca]" /> Perguntar ao cliente
              </p>
              <CopyButton value={questionsText} size="sm" variant="outline" className="border-[#c9d6e3] text-[#17395d]">
                Copiar perguntas
              </CopyButton>
            </div>
            <ol className="mt-3 space-y-2">
              {insights.clientQuestions.map((item, index) => (
                <li key={index} className="rounded-xl border border-[#e3e8ee] bg-white p-3">
                  <p className="text-sm font-medium text-[#24364e]">
                    {index + 1}. {item.question}
                  </p>
                  {(item.reason || trackName(item.track)) && (
                    <p className="mt-1 text-xs leading-5 text-[#718196]">
                      {trackName(item.track) && <span className="font-medium text-[#53667e]">{trackName(item.track)} · </span>}
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
            <p className="flex items-center gap-2 text-sm font-semibold text-[#24364e]">
              <Lightbulb className="size-4 text-[#d99a00]" /> Frentes a explorar
            </p>
            <ul className="mt-3 space-y-2">
              {insights.opportunities.map((item, index) => (
                <li key={index} className="rounded-xl border border-[#f1e6c4] bg-[#fffbf0] p-3 text-xs leading-5 text-[#5f5640]">
                  <p className="text-sm font-semibold text-[#3d3624]">{item.title}</p>
                  <p className="mt-1">{item.description}</p>
                  {item.value && <p className="mt-1 text-[#8a7a4d]">Valor: {item.value}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {insights.risks.length > 0 && (
          <section>
            <p className="flex items-center gap-2 text-sm font-semibold text-[#24364e]">
              <TriangleAlert className="size-4 text-[#d4574a]" /> Riscos e pontos de atenção
            </p>
            <ul className="mt-3 space-y-2">
              {insights.risks.map((risk, index) => (
                <li key={index} className="rounded-xl border border-[#f3d5d1] bg-[#fff7f6] p-3 text-xs leading-5 text-[#7a3f38]">
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
