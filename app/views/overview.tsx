import { AppWindow, ArrowRight, Box, Building2, GitBranch, GraduationCap, Route, Sparkles, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "../components/page-header";

const highlights = [
  { title: "Perguntas que se adaptam", text: "As trilhas escolhidas revelam somente as perguntas relevantes para o cenário.", icon: GitBranch },
  { title: "Método visível", text: "Cada resposta mostra qual fase, artefato e decisão arquitetural ela alimenta.", icon: GraduationCap },
  { title: "Zoom com propósito", text: "Context, Container, Component e Deployment entram apenas quando contam uma história útil.", icon: Box },
  { title: "IA sem chave", text: "Gere um pedido pronto, cole no assistente de IA que você já usa e traga de volta trilhas, lacunas, perguntas e frentes.", icon: Sparkles },
];

export function OverviewView({ onStart, onQualify }: { onStart: () => void; onQualify: () => void }) {
  return (
    <>
      <PageHeader
        eyebrow="Seu laboratório de arquitetura"
        title="Transforme perguntas soltas em uma jornada arquitetural"
        description="Conduza o discovery, enxergue lacunas e aprenda por que cada informação importa — sem aplicar TOGAF como cerimônia nem C4 como desenho decorativo."
      />
      <div className="grid-gap relative flex-1 p-5 md:p-8">
        <section className="overflow-hidden rounded-[28px] border border-[#1e3552] bg-[#0c1929] text-white shadow-[0_24px_80px_rgba(15,31,53,.16)]">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <div className="p-7 md:p-10">
              <Badge className="border border-[#326395] bg-[#153556] text-[#a9d3ff]">TOGAF × C4 × Discovery</Badge>
              <h2 className="mt-6 max-w-xl text-4xl font-semibold tracking-[-.045em] md:text-5xl">
                Entenda o cenário.
                <br />
                Desenhe a mudança.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#9fb0c4] md:text-base">
                Qualifique a oportunidade, escolha as frentes técnicas e percorra Objetivo → AS-IS → Gaps → TO-BE → Transição →
                Governança. No fim, copie textos prontos para CRM e Engenharia.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button onClick={onQualify} className="h-11 bg-[#5aa8ff] px-5 text-[#07111f] hover:bg-[#7bbaff]">
                  Qualificar oportunidade <ArrowRight />
                </Button>
                <Button
                  onClick={onStart}
                  variant="outline"
                  className="h-11 border-[#37516f] bg-transparent px-5 text-[#bfd1e4] hover:bg-white/5 hover:text-white"
                >
                  Ir direto ao discovery
                </Button>
              </div>
            </div>
            <div className="relative min-h-[310px] border-t border-white/8 bg-[#0a1523] p-7 lg:border-l lg:border-t-0">
              <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(104,151,205,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(104,151,205,.15)_1px,transparent_1px)] [background-size:28px_28px]" />
              <div className="relative mx-auto flex h-full max-w-md flex-col justify-center">
                <div className="rounded-2xl border border-[#355170] bg-[#101f31] p-4 shadow-xl">
                  <p className="text-[10px] uppercase tracking-[.2em] text-[#6f9dcc]">Sistema em foco</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-[#193b60]">
                      <AppWindow className="text-[#74b5f9]" />
                    </div>
                    <div>
                      <p className="font-medium">Plataforma atual</p>
                      <p className="text-xs text-[#7f91a7]">Aplicações, dados e operação</p>
                    </div>
                  </div>
                </div>
                <div className="mx-auto h-8 w-px bg-[#355170]" />
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      ["Gaps", Route],
                      ["TO-BE", Building2],
                      ["Roadmap", Workflow],
                    ] as const
                  ).map(([label, Icon]) => (
                    <div key={label} className="rounded-xl border border-[#263e59] bg-[#0e1c2c] p-3 text-center">
                      <Icon className="mx-auto size-4 text-[#53d8a0]" />
                      <p className="mt-2 text-[11px] text-[#a6b4c5]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="gap-4 border-[#dde4ec] bg-white py-5 shadow-none">
                <CardHeader className="px-5">
                  <div className="flex items-center justify-between">
                    <Icon className="size-5 text-[#337fca]" />
                    <span className="font-mono text-xs text-[#a0adbb]">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <CardTitle className="mt-4 text-lg text-[#17283f]">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-5 text-sm leading-6 text-[#65758a]">{item.text}</CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </>
  );
}
