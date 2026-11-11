import { Building2, Route, SearchCheck, ShieldCheck, Target, Workflow } from "lucide-react";

export const phases = [
  {
    id: "vision",
    name: "Objetivo",
    subtitle: "Por que mudar",
    icon: Target,
    guide: "Alinha motivadores, stakeholders, resultado esperado, escopo inicial e critérios de sucesso.",
  },
  {
    id: "asis",
    name: "AS-IS",
    subtitle: "Onde estamos",
    icon: SearchCheck,
    guide: "Documenta a baseline relevante de negócio, aplicações, dados e tecnologia, distinguindo fato de lacuna.",
  },
  {
    id: "gaps",
    name: "Gaps",
    subtitle: "O que falta",
    icon: Route,
    guide: "Compara baseline e target para revelar capacidades ausentes, riscos, restrições e dependências.",
  },
  {
    id: "tobe",
    name: "TO-BE",
    subtitle: "Onde chegar",
    icon: Building2,
    guide: "Descreve as capacidades e fronteiras do cenário-alvo sem antecipar detalhes que ainda não têm evidência.",
  },
  {
    id: "transition",
    name: "Transição",
    subtitle: "Como chegar",
    icon: Workflow,
    guide: "Organiza ondas, quick wins, dependências e estados intermediários para tornar a mudança executável.",
  },
  {
    id: "governance",
    name: "Governança",
    subtitle: "Como sustentar",
    icon: ShieldCheck,
    guide: "Registra decisões, princípios, responsáveis, critérios e mecanismos de acompanhamento da arquitetura.",
  },
] as const;

export type Phase = (typeof phases)[number];
