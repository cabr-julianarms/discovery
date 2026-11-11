import { useState, type ComponentProps, type ReactNode } from "react";
import { Check, ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/browser";

export function CopyButton({
  value,
  children,
  copiedLabel = "Copiado",
  icon,
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick" | "value"> & {
  value: string | (() => string);
  copiedLabel?: string;
  icon?: ReactNode;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const copy = async () => {
    const ok = await copyText(typeof value === "function" ? value() : value);
    setState(ok ? "copied" : "failed");
    window.setTimeout(() => setState("idle"), 1800);
  };
  return (
    <Button {...props} onClick={copy}>
      {state === "copied" ? <Check /> : (icon ?? <ClipboardCopy />)}
      {state === "copied" ? copiedLabel : state === "failed" ? "Não foi possível copiar" : children}
    </Button>
  );
}
