import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { migrationStrategies, pillars } from "@/config/frameworks";
import { PageHeader } from "../components/page-header";
import { strategyTone } from "../components/workload-table";

export function PillarsGuideView() {
  return (
    <>
      <PageHeader
        eyebrow="Requisitos transversais"
        title="Google Cloud Architecture Framework"
        description="Os pilares de uma arquitetura bem feita no Google Cloud. No Lab, cada pilar vira uma pergunta na aba Pilares do discovery, independente da trilha."
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.id} className="gap-3 border-line py-5 shadow-none">
                <CardHeader className="px-5">
                  <div className="flex items-center justify-between">
                    <div className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-mono text-xs text-ink-faint">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <CardTitle className="mt-3 text-base text-ink">{pillar.name}</CardTitle>
                  <CardDescription className="leading-6">{pillar.summary}</CardDescription>
                </CardHeader>
                <CardContent className="px-5">
                  <p className="rounded-lg bg-surface-2 p-3 text-xs leading-5 text-ink-soft">
                    <span className="block text-[10px] font-semibold uppercase tracking-[.14em] text-ink-faint">Pergunta no discovery</span>
                    {pillar.question}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-5 rounded-2xl border border-brand-line bg-brand-soft p-5 text-sm leading-6 text-ink-soft">
          <strong className="text-brand-strong">Como usar:</strong> em pré-vendas, os pilares não são uma auditoria. Servem para
          garantir que segurança, custo e disponibilidade foram perguntados antes de dimensionar ou propor a solução.
        </div>
      </div>
    </>
  );
}

export function MigrationGuideView() {
  return (
    <>
      <PageHeader
        eyebrow="Decisão por workload"
        title="Estratégias de migração (7 Rs)"
        description="Nem tudo precisa ir para a nuvem do mesmo jeito. Para cada sistema, escolha um destino. No discovery, use a aba Workloads (aparece com a trilha de Migração)."
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {migrationStrategies.map((strategy, index) => (
            <div key={strategy.id} className={`grid gap-3 p-5 md:grid-cols-[220px_1fr_1fr] ${index ? "border-t border-line" : ""}`}>
              <div>
                <span className={`rounded px-2 py-0.5 text-xs font-semibold ${strategyTone[strategy.id]}`}>{strategy.name}</span>
                <p className="mt-2 font-semibold text-ink">{strategy.label}</p>
                <p className="mt-1 text-sm leading-6 text-ink-muted">{strategy.summary}</p>
              </div>
              <div className="text-sm leading-6 text-ink-muted">
                <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-ink-faint">Quando faz sentido</p>
                {strategy.when}
              </div>
              <div className="text-sm leading-6 text-ink-muted">
                <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-ink-faint">O que perguntar</p>
                {strategy.ask}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-brand-line bg-brand-soft p-5 text-sm leading-6 text-ink-soft">
          <strong className="text-brand-strong">Dica:</strong> a ordem acima vai do menor para o maior esforço. Começar retirando o
          que não é usado e mantendo o que não pode mover reduz o escopo antes de estimar o resto.
        </div>
      </div>
    </>
  );
}
