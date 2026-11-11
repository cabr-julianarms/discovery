import { ChevronRight, CircleHelp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { migrationStrategies } from "@/config/frameworks";
import type { Workload } from "@/lib/local-discoveries";

const strategyTone: Record<string, string> = {
  retire: "bg-surface-2 text-ink-muted",
  retain: "bg-surface-2 text-ink-soft",
  rehost: "bg-brand-soft text-brand-strong",
  relocate: "bg-brand-soft text-brand-strong",
  repurchase: "bg-warn-soft text-warn",
  replatform: "bg-success-soft text-success",
  refactor: "bg-ai-soft text-ai",
};

export function WorkloadTable({ workloads, onChange }: { workloads: Workload[]; onChange: (workloads: Workload[]) => void }) {
  const [help, setHelp] = useState(false);
  const update = (index: number, patch: Partial<Workload>) =>
    onChange(workloads.map((item, position) => (position === index ? { ...item, ...patch } : item)));
  const counts = migrationStrategies
    .map((strategy) => ({ strategy, count: workloads.filter((item) => item.strategy === strategy.id).length }))
    .filter((item) => item.count);

  return (
    <div className="p-5 md:p-6">
      {workloads.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[.12em] text-ink-faint">
                <th className="pb-2 pr-3 font-semibold">Workload</th>
                <th className="w-56 pb-2 pr-3 font-semibold">Estratégia</th>
                <th className="pb-2 pr-3 font-semibold">Motivo / o que confirmar</th>
                <th className="w-10 pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {workloads.map((item, index) => (
                <tr key={index} className="align-top">
                  <td className="py-2 pr-3">
                    <Input
                      value={item.name}
                      onChange={(event) => update(index, { name: event.target.value })}
                      placeholder="Ex.: ERP Protheus"
                      className="h-9 bg-surface-2"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      value={item.strategy}
                      onChange={(event) => update(index, { strategy: event.target.value })}
                      className={`h-9 w-full rounded-md border border-line px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${item.strategy ? strategyTone[item.strategy] : "bg-surface-2 text-ink-faint"}`}
                    >
                      <option value="">A definir</option>
                      {migrationStrategies.map((strategy) => (
                        <option key={strategy.id} value={strategy.id}>
                          {strategy.name} · {strategy.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <Input
                      value={item.note}
                      onChange={(event) => update(index, { note: event.target.value })}
                      placeholder="Por que essa estratégia ou o que falta saber"
                      className="h-9 bg-surface-2"
                    />
                  </td>
                  <td className="py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover ${item.name || "workload"}`}
                      className="size-9 text-ink-faint hover:text-danger"
                      onClick={() => onChange(workloads.filter((_, position) => position !== index))}
                    >
                      <Trash2 />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-line-strong bg-surface-2 p-5 text-center text-sm text-ink-muted">
          Liste os sistemas, servidores ou bancos e decida o destino de cada um. A IA também pode sugerir a partir do material.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => onChange([...workloads, { name: "", strategy: "", note: "" }])}>
          <Plus /> Adicionar workload
        </Button>
        {counts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {counts.map(({ strategy, count }) => (
              <span key={strategy.id} className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${strategyTone[strategy.id]}`}>
                {strategy.name}: {count}
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setHelp(!help)}
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-strong"
      >
        <CircleHelp className="size-3.5" /> Qual estratégia escolher?
        <ChevronRight className={`size-3 transition ${help ? "rotate-90" : ""}`} />
      </button>
      {help && (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {migrationStrategies.map((strategy) => (
            <div key={strategy.id} className="rounded-xl border border-line bg-white p-3 text-xs leading-5 text-ink-muted">
              <p className="text-sm font-semibold text-ink">
                <span className={`mr-1.5 rounded px-1.5 py-0.5 text-[11px] ${strategyTone[strategy.id]}`}>{strategy.name}</span>
                {strategy.label}
              </p>
              <p className="mt-1.5">{strategy.summary}</p>
              <p className="mt-1">
                <span className="font-medium text-ink-soft">Quando:</span> {strategy.when}
              </p>
              <p className="mt-1">
                <span className="font-medium text-ink-soft">Pergunte:</span> {strategy.ask}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { strategyTone };
