import { CircleHelp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Track } from "@/config/tracks";

export function C4MiniMap({ selected }: { selected: Track[] }) {
  return (
    <Card className="gap-4 overflow-hidden border-[#dce3eb] py-5 shadow-none">
      <CardHeader className="px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-[#1d3048]">C4 · leitura provisória</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <button aria-label="Sobre a leitura C4">
                <CircleHelp className="size-4 text-[#91a0b2]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>O mapa muda conforme as trilhas selecionadas.</TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="px-5">
        <div className="rounded-xl border border-[#dce5ee] bg-[#f5f8fb] p-3">
          <div className="mx-auto max-w-[220px] rounded-lg border border-dashed border-[#8da5be] bg-white p-3 text-center">
            <p className="text-[10px] uppercase tracking-[.16em] text-[#8291a3]">System in scope</p>
            <p className="mt-1 text-xs font-semibold text-[#32465f]">Solução a descobrir</p>
          </div>
          <div className="mx-auto h-5 w-px bg-[#b9c5d2]" />
          {selected.length ? (
            <div className="grid grid-cols-2 gap-2">
              {selected.map((track) => (
                <div
                  key={track.id}
                  className="rounded-lg border bg-white p-2 text-center text-[10px] font-medium text-[#53667e]"
                  style={{ borderColor: `${track.color}80` }}
                >
                  {track.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#c7d1dc] p-3 text-center text-[10px] text-[#8694a5]">
              Selecione trilhas para revelar fronteiras
            </div>
          )}
        </div>
        <p className="mt-3 text-[11px] leading-5 text-[#7a899c]">
          Não é um diagrama final. É um lembrete visual do que ainda precisa ser confirmado.
        </p>
      </CardContent>
    </Card>
  );
}
