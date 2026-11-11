import type { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-[#dfe5eb] bg-white/85 px-5 py-5 backdrop-blur md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <SidebarTrigger className="mt-0.5 md:hidden" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#337fca]">{eyebrow}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-.035em] text-[#132238] md:text-3xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#607087]">{description}</p>
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
