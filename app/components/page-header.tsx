import type { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

/** Cabeçalho fixo no topo: título e ações (salvar, novo…) sempre à mão. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 px-5 py-4 backdrop-blur-md md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 items-start gap-3">
          <SidebarTrigger className="mt-1 text-ink-muted md:hidden" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-brand">{eyebrow}</p>
            <h1 className="mt-0.5 truncate text-xl font-semibold tracking-[-.02em] text-ink md:text-2xl">{title}</h1>
            {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-ink-muted">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/** Cabeçalho de seção dentro de um card. */
export function SectionHeader({
  icon,
  title,
  description,
  aside,
  tone = "neutral",
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  tone?: "neutral" | "brand" | "success";
}) {
  const tones = {
    neutral: "border-line bg-surface-2",
    brand: "border-brand-line/70 bg-brand-soft",
    success: "border-success-line bg-success-soft",
  };
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4 md:px-6 ${tones[tone]}`}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-brand shadow-xs ring-1 ring-line">{icon}</div>}
        <div className="min-w-0">
          <p className="font-semibold text-ink">{title}</p>
          {description && <p className="mt-0.5 text-xs leading-5 text-ink-muted">{description}</p>}
        </div>
      </div>
      {aside}
    </div>
  );
}
