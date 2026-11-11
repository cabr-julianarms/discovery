import { CircleHelp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Track } from "@/config/tracks";

export function C4MiniMap({ selected }: { selected: Track[] }) {
  return (
    <Card className="gap-4 overflow-hidden border-line py-5 shadow-none">
      <CardHeader className="px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-ink">C4 · leitura provisória</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <button aria-label="Sobre a leitura C4">
                <CircleHelp className="size-4 text-ink-faint" />
              </button>
            </TooltipTrigger>
            <TooltipContent>O mapa muda conforme as trilhas selecionadas.</TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="px-5">
        <div className="rounded-xl border border-line bg-surface-2 p-3">
          <div className="mx-auto max-w-[220px] rounded-lg border border-dashed border-ink-faint bg-white p-3 text-center">
            <p className="text-[10px] uppercase tracking-[.16em] text-ink-faint">System in scope</p>
            <p className="mt-1 text-xs font-semibold text-ink-soft">Solução a descobrir</p>
          </div>
          <div className="mx-auto h-5 w-px bg-line-strong" />
          {selected.length ? (
            <div className="grid grid-cols-2 gap-2">
              {selected.map((track) => (
                <div
                  key={track.id}
                  className="rounded-lg border bg-white p-2 text-center text-[10px] font-medium text-ink-soft"
                  style={{ borderColor: `${track.color}80` }}
                >
                  {track.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-line-strong p-3 text-center text-[10px] text-ink-faint">
              Selecione trilhas para revelar fronteiras
            </div>
          )}
        </div>
        <p className="mt-3 text-[11px] leading-5 text-ink-faint">
          Não é um diagrama final. É um lembrete visual do que ainda precisa ser confirmado.
        </p>
      </CardContent>
    </Card>
  );
}
