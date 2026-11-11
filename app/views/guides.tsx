import { ArrowRight, Box, Braces, Check, Code2, Network, ServerCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { phases } from "@/config/phases";
import { tracks } from "@/config/tracks";
import { PageHeader } from "../components/page-header";

export function TogafGuideView() {
  return (
    <>
      <PageHeader
        eyebrow="Método como bússola"
        title="Jornada TOGAF adaptada ao discovery"
        description="Uma aplicação pragmática do raciocínio arquitetural. O Lab não reproduz o ADM completo nem substitui governança formal."
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="grid gap-4 lg:grid-cols-2">
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            return (
              <Card key={phase.id} className="gap-4 border-line py-5 shadow-none">
                <CardHeader className="px-5">
                  <div className="flex items-start gap-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[.18em] text-ink-faint">
                        Etapa {String(index + 1).padStart(2, "0")}
                      </p>
                      <CardTitle className="mt-1 text-lg text-ink">{phase.name}</CardTitle>
                      <CardDescription className="mt-2">{phase.subtitle}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-5 text-sm leading-6 text-ink-muted">{phase.guide}</CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-5 rounded-2xl border border-brand-line bg-brand-soft p-5 text-sm leading-6 text-ink-soft">
          <strong className="text-brand-strong">Regra do Lab:</strong> usar o mínimo de método necessário para reduzir ambiguidade. O nome
          TOGAF aparece para ensinar a lente; o discovery continua orientado à decisão.
        </div>
      </div>
    </>
  );
}

const c4Levels = [
  { name: "Context", subtitle: "O sistema no mundo", icon: Network, text: "Pessoas, sistema em foco e sistemas externos. É o ponto de partida para alinhar fronteiras e relações." },
  { name: "Container", subtitle: "Aplicações e data stores", icon: Box, text: "Mostra responsabilidades, tecnologias e comunicação dentro de um único software system." },
  { name: "Component", subtitle: "Estruturas internas relevantes", icon: Braces, text: "Abre um container somente quando seus componentes ajudam uma decisão ou explicam um risco." },
  { name: "Code", subtitle: "Implementação", icon: Code2, text: "Raramente necessário em pré-vendas. Entra apenas quando o discovery exige desenho próximo do código." },
  { name: "Deployment", subtitle: "Software na infraestrutura", icon: ServerCog, text: "Conecta instâncias a ambientes, nós, redes, load balancers e demais elementos de infraestrutura." },
];

export function C4GuideView() {
  return (
    <>
      <PageHeader
        eyebrow="Zoom com intenção"
        title="Modelos C4"
        description="C4 é hierárquico, mas não obriga usar todos os níveis. Context e Container resolvem a maior parte das conversas; Deployment complementa a visão de infraestrutura."
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {c4Levels.map((level, index) => {
            const Icon = level.icon;
            return (
              <Card key={level.name} className={`gap-4 border-line py-5 shadow-none ${index === 4 ? "md:col-span-2 xl:col-span-1" : ""}`}>
                <CardHeader className="px-5">
                  <div className="flex items-center justify-between">
                    <div className="grid size-10 place-items-center rounded-xl bg-navy text-sky">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-mono text-xs text-ink-faint">C{index < 4 ? index + 1 : "+"}</span>
                  </div>
                  <CardTitle className="mt-4 text-lg text-ink">{level.name}</CardTitle>
                  <CardDescription>{level.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="px-5 text-sm leading-6 text-ink-muted">{level.text}</CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function TracksGuideView({
  selectedTracks,
  setSelectedTracks,
  onStart,
}: {
  selectedTracks: string[];
  setSelectedTracks: (tracks: string[]) => void;
  onStart: () => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Questionários condicionais"
        title="Trilhas técnicas"
        description="Cada trilha traz perguntas de qualificação (primeira conversa) e de discovery técnico (AS-IS), e indica qual especialista envolver."
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tracks.map((track) => {
            const Icon = track.icon;
            const active = selectedTracks.includes(track.id);
            return (
              <button
                key={track.id}
                onClick={() => setSelectedTracks(active ? selectedTracks.filter((id) => id !== track.id) : [...selectedTracks, track.id])}
                className={`rounded-2xl border p-5 text-left transition ${active ? "border-brand-line bg-brand-soft" : "border-line bg-white hover:-translate-y-0.5 hover:border-line-strong"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl" style={{ backgroundColor: `${track.color}20`, color: track.color }}>
                    <Icon className="size-5" />
                  </span>
                  {active && (
                    <span className="grid size-6 place-items-center rounded-full bg-brand text-white">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </div>
                <h3 className="mt-5 font-semibold text-ink">{track.name}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{track.short}</p>
                <p className="mt-3 text-xs text-ink-muted">
                  <span className="font-medium text-ink-soft">Especialista:</span> {track.specialist}
                </p>
                <p className="mt-3 text-xs font-medium text-brand">
                  {track.qualificationQuestions.length} perguntas de qualificação · {track.questions.length} de discovery técnico
                </p>
              </button>
            );
          })}
        </div>
        <Button onClick={onStart} className="mt-6">
          Usar trilhas selecionadas <ArrowRight />
        </Button>
      </div>
    </>
  );
}

const terms = [
  ["Baseline / AS-IS", "Descrição relevante do estado atual, sustentada por evidência."],
  ["Target / TO-BE", "Estado futuro desejado e as capacidades necessárias para alcançá-lo."],
  ["Gap", "Diferença entre baseline e target que exige mudança, decisão ou validação."],
  ["Container (C4)", "Aplicação ou data store; não significa necessariamente container Docker."],
  ["Boundary", "Fronteira de responsabilidade ou escopo que ajuda a deixar ownership explícito."],
  ["Deployment node", "Local onde uma instância de sistema ou container é executada."],
  ["Premissa", "Afirmação ainda não confirmada adotada temporariamente para avançar."],
  ["Restrição", "Condição que limita opções de arquitetura, prazo, tecnologia ou operação."],
  ["RTO / RPO", "Tempo máximo para voltar a operar (RTO) e quantidade máxima de dados que se aceita perder (RPO)."],
  ["ADR", "Architecture Decision Record: registro curto de uma decisão, do contexto e das alternativas descartadas."],
  ["Rehost / Replatform / Refactor", "Estratégias de migração: mover como está, ajustar a plataforma ou reescrever partes da aplicação."],
];

export function GlossaryView() {
  return (
    <>
      <PageHeader
        eyebrow="Linguagem compartilhada"
        title="Glossário prático"
        description="Conceitos usados pelo Lab, traduzidos para o contexto de discovery e pré-vendas."
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {terms.map(([term, meaning], index) => (
            <div key={term} className={`grid gap-2 p-5 md:grid-cols-[220px_1fr] ${index ? "border-t border-line" : ""}`}>
              <p className="font-semibold text-ink">{term}</p>
              <p className="text-sm leading-6 text-ink-muted">{meaning}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
