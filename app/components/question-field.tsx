import { useState } from "react";
import { ChevronRight, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { LearningNote } from "@/config/learning-notes";

export function QuestionField({
  index,
  question,
  badge,
  value,
  onChange,
  placeholder,
  note,
}: {
  index: number;
  question: string;
  badge?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  note?: LearningNote;
}) {
  const [open, setOpen] = useState(false);
  const pendingAi = value.startsWith("[A confirmar]");
  return (
    <div className="p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 font-mono text-[10px] text-ink-muted">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium leading-6 text-ink">{question}</p>
            {badge && (
              <Badge variant="secondary" className="bg-surface-2 text-[10px] text-ink-muted">
                {badge}
              </Badge>
            )}
            {pendingAi && (
              <Badge variant="secondary" className="bg-warn-soft text-[10px] text-warn">
                Sugerido pela IA · confirmar
              </Badge>
            )}
          </div>
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={`mt-3 min-h-20 resize-y ${pendingAi ? "border-warn-line bg-warn-soft" : "bg-surface-2"}`}
          />
          {note && (
            <>
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-strong"
              >
                <CircleHelp className="size-3.5" /> Por que perguntamos isso?
                <ChevronRight className={`size-3 transition ${open ? "rotate-90" : ""}`} />
              </button>
              {open && (
                <div className="mt-3 grid gap-3 rounded-xl border border-brand-line bg-brand-soft p-4 text-xs leading-5 text-ink-soft md:grid-cols-2">
                  {(
                    [
                      ["Intenção", note.why],
                      ["TOGAF adaptado", note.togaf],
                      ["Leitura C4", note.c4],
                      ["Boa resposta", note.good],
                    ] as const
                  ).map(([label, text]) => (
                    <div key={label}>
                      <p className="font-semibold text-brand-strong">{label}</p>
                      <p className="mt-1">{text}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
