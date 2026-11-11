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
        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#edf2f7] font-mono text-[10px] text-[#65758a]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium leading-6 text-[#24364e]">{question}</p>
            {badge && (
              <Badge variant="secondary" className="bg-[#f1f4f7] text-[10px] text-[#68798e]">
                {badge}
              </Badge>
            )}
            {pendingAi && (
              <Badge variant="secondary" className="bg-[#fff4d6] text-[10px] text-[#8a6100]">
                Sugerido pela IA · confirmar
              </Badge>
            )}
          </div>
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={`mt-3 min-h-20 resize-y ${pendingAi ? "border-[#f0d58a] bg-[#fffcf3]" : "bg-[#fbfcfd]"}`}
          />
          {note && (
            <>
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#337fca] hover:text-[#175c9f]"
              >
                <CircleHelp className="size-3.5" /> Por que perguntamos isso?
                <ChevronRight className={`size-3 transition ${open ? "rotate-90" : ""}`} />
              </button>
              {open && (
                <div className="mt-3 grid gap-3 rounded-xl border border-[#cfe1f2] bg-[#f2f8fe] p-4 text-xs leading-5 text-[#52677d] md:grid-cols-2">
                  {(
                    [
                      ["Intenção", note.why],
                      ["TOGAF adaptado", note.togaf],
                      ["Leitura C4", note.c4],
                      ["Boa resposta", note.good],
                    ] as const
                  ).map(([label, text]) => (
                    <div key={label}>
                      <p className="font-semibold text-[#245d91]">{label}</p>
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
