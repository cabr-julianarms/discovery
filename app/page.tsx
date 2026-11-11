import { useEffect, useMemo, useState } from "react";
import {
  AppWindow,
  ArrowRight,
  BookOpen,
  Box,
  Braces,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardPaste,
  CloudCog,
  Code2,
  Database,
  GitBranch,
  GraduationCap,
  HardDrive,
  FolderOpen,
  LayoutDashboard,
  LoaderCircle,
  Network,
  Plus,
  Route,
  Save,
  SearchCheck,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Target,
  UserRoundSearch,
  Users,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { tracks, type Track } from "@/config/tracks";
import { detectTrackIds, discoveryCoverage, phaseQuestions } from "@/lib/discovery-rules";
import { listDiscoveries, saveDiscovery as saveLocalDiscovery, type DiscoveryDraft } from "@/lib/local-discoveries";

type View =
  | "overview"
  | "qualify"
  | "discovery"
  | "saved"
  | "togaf"
  | "c4"
  | "tracks"
  | "glossary";

const phases = [
  { id: "vision", name: "Objetivo", subtitle: "Por que mudar", icon: Target },
  { id: "asis", name: "AS-IS", subtitle: "Onde estamos", icon: SearchCheck },
  { id: "gaps", name: "Gaps", subtitle: "O que falta", icon: Route },
  { id: "tobe", name: "TO-BE", subtitle: "Onde chegar", icon: Building2 },
  {
    id: "transition",
    name: "Transição",
    subtitle: "Como chegar",
    icon: Workflow,
  },
  {
    id: "governance",
    name: "Governança",
    subtitle: "Como sustentar",
    icon: ShieldCheck,
  },
];

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "qualify", label: "Qualificar oportunidade", icon: UserRoundSearch },
  { id: "discovery", label: "Discovery atual", icon: Plus },
  { id: "saved", label: "Projetos salvos", icon: FolderOpen },
  { id: "togaf", label: "Jornada TOGAF", icon: Route },
  { id: "c4", label: "Modelos C4", icon: Box },
  { id: "tracks", label: "Trilhas técnicas", icon: Network },
  { id: "glossary", label: "Glossário", icon: BookOpen },
];

const learningNotes: Record<
  string,
  { why: string; togaf: string; c4: string; good: string }
> = {
  "Quais workloads, bancos e volumes estão no escopo?": {
    why: "Delimita o objeto da transformação e evita que o inventário seja confundido com escopo aprovado.",
    togaf: "Baseline da arquitetura de Aplicações, Dados e Tecnologia.",
    c4: "Alimenta System Landscape, Container e Deployment.",
    good: "Liste workload, função, ambiente, tecnologia, volume, owner e criticidade.",
  },
  "Qual decisão ou tarefa humana o caso de uso pretende apoiar?": {
    why: "Começa pelo resultado e impede que a solução nasça como 'vamos colocar IA em alguma coisa'.",
    togaf: "Architecture Vision e motivadores de negócio.",
    c4: "Identifica pessoas, sistema em foco e relações no Context.",
    good: "Descreva ator, tarefa atual, dor, frequência e resultado esperado.",
  },
  "Como uma mudança percorre código, teste, aprovação e produção?": {
    why: "Revela o fluxo real de entrega, suas esperas, controles e pontos de falha.",
    togaf: "Baseline, gaps operacionais e oportunidades de transição.",
    c4: "Pode alimentar um Dynamic Diagram e o Deployment por ambiente.",
    good: "Narre desde o commit até produção, incluindo pessoas, ferramentas e gates.",
  },
};

function AppSidebar({
  active,
  onNavigate,
}: {
  active: View;
  onNavigate: (view: View) => void;
}) {
  return (
    <Sidebar collapsible="icon" className="border-r border-white/8">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#5aa8ff] text-[#07111f] shadow-[0_0_28px_rgba(90,168,255,.26)]">
            <Braces className="size-5" />
          </div>
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <p className="truncate font-semibold tracking-tight">
              Discovery Lab
            </p>
            <p className="truncate text-[11px] uppercase tracking-[.18em] text-[#7f8da3]">
              Architecture workspace
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[.2em] text-[#627087]">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      isActive={active === item.id}
                      onClick={() => onNavigate(item.id)}
                      className="h-10 cursor-pointer data-[active=true]:bg-[#14253b] data-[active=true]:text-[#8fc3ff]"
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="m-3 rounded-xl border border-[#25364d] bg-[#101c2c] p-3 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-2 text-xs font-medium text-[#b9c8da]">
          <GraduationCap className="size-4 text-[#53d8a0]" /> Modo aprendizado
          ativo
        </div>
        <p className="mt-2 text-[11px] leading-5 text-[#74849a]">
          Cada pergunta explica método, artefato e nível C4.
        </p>
      </div>
    </Sidebar>
  );
}

function Header({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="border-b border-[#dfe5eb] bg-white/85 px-5 py-5 backdrop-blur md:px-8">
      <div className="flex items-start gap-3">
        <SidebarTrigger className="mt-0.5 md:hidden" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#337fca]">
            {eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-.035em] text-[#132238] md:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#607087]">
            {description}
          </p>
        </div>
      </div>
    </header>
  );
}

function extractCompany(bant: string) {
  return (
    bant.match(/Nome da Empresa:\s*([^\n.]+)/i)?.[1]?.trim() ??
    bant.match(/Empresa:\s*([^\n.]+)/i)?.[1]?.trim() ??
    ""
  );
}

function sanitizeBant(bant: string) {
  return bant
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[e-mail removido]")
    .replace(/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?9?\d{4}[-\s]?\d{4}/g, "[telefone removido]");
}

const firstMeetingQuestions = [
  "O que o cliente quer melhorar, resolver ou criar?",
  "Como esse processo, sistema ou ambiente funciona hoje?",
  "Quem será impactado ou usará a solução?",
  "Quais tecnologias, sistemas, dados ou ambientes já foram mencionados?",
  "Existe prazo, urgência, orçamento ou algum evento motivando a conversa?",
];

function answerOrPending(value?: string) {
  return value?.trim() || "A confirmar com o cliente";
}

function QualificationWorkspace({
  onStartDiscovery,
}: {
  onStartDiscovery: (draft: DiscoveryDraft) => void;
}) {
  const [context, setContext] = useState("");
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [analyzed, setAnalyzed] = useState(false);
  const [copied, setCopied] = useState<"crm" | "engineering" | null>(null);
  const selected = tracks.filter((track) => selectedTracks.includes(track.id));
  const questions = selected.flatMap((track) =>
    track.qualificationQuestions.map((question) => ({ track, question })),
  );
  const toggleTrack = (id: string) =>
    setSelectedTracks((current) =>
      current.includes(id)
        ? current.filter((trackId) => trackId !== id)
        : [...current, id],
    );
  const firstMeetingAnswered = firstMeetingQuestions.filter(
    (question) => answers[question]?.trim(),
  ).length;
  const technicalAnswered = questions.filter(({ question }) =>
    answers[question]?.trim(),
  ).length;
  const company = extractCompany(context);
  const identify = () => {
    const allKnownContext = [
      context,
      ...firstMeetingQuestions.map((question) => answers[question] ?? ""),
    ].join("\n");
    setSelectedTracks(detectTrackIds(allKnownContext, tracks));
    setAnalyzed(true);
  };
  const maturity = !firstMeetingAnswered
    ? "Contexto ainda não coletado"
    : firstMeetingAnswered < 4
      ? "Contexto inicial"
      : selected.length && technicalAnswered
        ? "Pronta para envolver especialista"
        : "Qualificação comercial registrada";
  const nextAction = !firstMeetingAnswered
    ? "Realizar a primeira conversa usando o roteiro universal."
    : !selected.length
      ? "Continuar a qualificação comercial; ainda não há sinal técnico suficiente para envolver Engenharia."
      : !technicalAnswered
        ? "Coletar as perguntas das trilhas antes de abrir uma agenda técnica."
        : `Acionar ${selected.map((track) => track.specialist).join(" + ")} para o próximo aprofundamento.`;
  const missing = [
    ...firstMeetingQuestions,
    ...questions.map(({ question }) => question),
  ].filter((question) => !answers[question]?.trim());
  const crmOutput = [
    "QUALIFICAÇÃO INICIAL DA OPORTUNIDADE",
    `Cliente: ${company || "A confirmar"}`,
    `Status: ${maturity}`,
    "",
    "1. OBJETIVO / DOR",
    answerOrPending(answers[firstMeetingQuestions[0]]),
    "",
    "2. CENÁRIO ATUAL",
    answerOrPending(answers[firstMeetingQuestions[1]]),
    "",
    "3. USUÁRIOS / ÁREAS IMPACTADAS",
    answerOrPending(answers[firstMeetingQuestions[2]]),
    "",
    "4. TECNOLOGIAS E TRILHAS IDENTIFICADAS",
    answerOrPending(answers[firstMeetingQuestions[3]]),
    `Trilhas: ${selected.length ? selected.map((track) => track.name).join(", ") : "Nenhuma confirmada"}`,
    "",
    "5. PRAZO / URGÊNCIA / ORÇAMENTO",
    answerOrPending(answers[firstMeetingQuestions[4]]),
    "",
    "6. LACUNAS PARA A PRÓXIMA CONVERSA",
    missing.length ? missing.map((item) => `- ${item}`).join("\n") : "- Nenhuma lacuna registrada",
    "",
    "7. PRÓXIMA AÇÃO",
    nextAction,
  ].join("\n");
  const engineeringOutput = [
    "HANDOFF PADRÃO PARA ENGENHARIA",
    `Cliente: ${company || "A confirmar"}`,
    `Maturidade: ${maturity}`,
    `Trilhas: ${selected.length ? selected.map((track) => track.name).join(", ") : "Nenhuma confirmada"}`,
    "",
    "Objetivo do cliente:",
    answerOrPending(answers[firstMeetingQuestions[0]]),
    "",
    "Cenário atual:",
    answerOrPending(answers[firstMeetingQuestions[1]]),
    "",
    "Respostas técnicas já coletadas:",
    ...(questions.length
      ? questions.map(
          ({ question }) => `- ${question}\n  ${answerOrPending(answers[question])}`,
        )
      : ["- Ainda não coletadas"]),
    "",
    "Resultado esperado da próxima conversa:",
    "Validar cenário, fechar lacunas e definir se existe base para arquitetura, demo, sizing ou proposta.",
  ].join("\n");
  const copyOutput = async (kind: "crm" | "engineering", value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1800);
  };
  const beginTechnicalDiscovery = () => {
    onStartDiscovery({
      title: company || "Oportunidade qualificada",
      outcome: "Aprofundar a oportunidade com o especialista adequado",
      problem: sanitizeBant([context, crmOutput].filter(Boolean).join("\n\n")).slice(0, 6000),
      tracks: selectedTracks,
      answers,
      status: "draft",
    });
  };

  return (
    <>
      <Header
        eyebrow="Pré-discovery comercial"
        title="Qualificar oportunidade"
        description="Comece com o que você tiver — BANT, e-mail, notas ou nada ainda — e termine a primeira conversa com um encaminhamento sempre igual."
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5">
            <Card className="gap-5 border-[#dce3eb] py-5 shadow-none">
              <CardHeader className="px-5 md:px-6">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e8f3ff] text-[#337fca]">
                    <ClipboardPaste className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-[#17283f]">
                      Comece com o que você já sabe
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Cole qualquer contexto disponível. Se ainda não houver
                      material, comece sem ele e use as cinco perguntas padrão.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 md:px-6">
                <Textarea
                  value={context}
                  onChange={(event) => {
                    setContext(event.target.value);
                    setAnalyzed(false);
                  }}
                  placeholder="Cole um BANT, e-mail, Take Notes, mensagem do cliente ou suas anotações. Este campo é opcional."
                  className="min-h-44 resize-y bg-[#fbfcfd] text-sm leading-6"
                />
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={identify}
                    className="bg-[#17395d] hover:bg-[#234d78]"
                  >
                    <SearchCheck /> {context.trim() ? "Identificar trilhas" : "Começar sem contexto"}
                  </Button>
                  <span className="text-xs text-[#718196]">
                    A análise acontece no navegador e o texto não é salvo nesta etapa.
                  </span>
                </div>
              </CardContent>
            </Card>

            {analyzed && (
              <Card className="gap-0 overflow-hidden border-[#bcd7ef] py-0 shadow-none">
                <div className="border-b border-[#d9e8f5] bg-[#f0f7fd] px-5 py-4 md:px-6">
                  <p className="font-semibold text-[#1d3048]">As cinco perguntas de toda primeira conversa</p>
                  <p className="mt-1 text-xs text-[#687d91]">A ordem não muda. Registre o que souber e use “não sabe” quando essa for a resposta real.</p>
                </div>
                <div className="divide-y divide-[#e5eaf0]">
                  {firstMeetingQuestions.map((question, index) => (
                    <div key={question} className="p-5 md:p-6">
                      <div className="flex items-start gap-3">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#17395d] font-mono text-[10px] text-white">{String(index + 1).padStart(2, "0")}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-6 text-[#24364e]">{question}</p>
                          <Textarea
                            value={answers[question] ?? ""}
                            onChange={(event) => setAnswers((current) => ({ ...current, [question]: event.target.value }))}
                            placeholder="Resposta do cliente ou “não sabe”."
                            className="mt-3 min-h-20 resize-y bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d9e8f5] bg-[#f8fbfe] px-5 py-4 md:px-6">
                  <span className="text-xs text-[#687d91]">{firstMeetingAnswered}/5 respostas registradas</span>
                  <Button onClick={identify} variant="outline" className="border-[#9abbd8] text-[#17395d]">
                    <SearchCheck /> Atualizar trilhas
                  </Button>
                </div>
              </Card>
            )}

            {analyzed && (
              <Card className="gap-5 border-[#dce3eb] py-5 shadow-none">
                <CardHeader className="px-5 md:px-6">
                  <CardTitle className="text-lg text-[#17283f]">
                    Confirme as frentes da oportunidade
                  </CardTitle>
                  <CardDescription>
                    As sugestões vêm de todo o contexto registrado. Marque ou
                    desmarque o que fizer sentido antes de avançar.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 px-5 md:grid-cols-2 md:px-6">
                  {tracks.map((track) => {
                    const Icon = track.icon;
                    const checked = selectedTracks.includes(track.id);
                    return (
                      <label
                        key={track.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${checked ? "border-[#82b9ee] bg-[#f0f7ff]" : "border-[#e1e7ed] bg-white hover:border-[#b7c6d6]"}`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleTrack(track.id)}
                          className="mt-0.5"
                        />
                        <span
                          className="grid size-8 shrink-0 place-items-center rounded-lg"
                          style={{
                            backgroundColor: `${track.color}20`,
                            color: track.color,
                          }}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[#23344b]">
                            {track.name}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[#718196]">
                            {track.short}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {selected.length > 0 && (
              <Card className="gap-0 overflow-hidden border-[#dce3eb] py-0 shadow-none">
                <div className="border-b border-[#e1e7ed] bg-[#f7f9fb] px-5 py-4 md:px-6">
                  <p className="font-semibold text-[#1d3048]">
                    Roteiro da primeira reunião
                  </p>
                  <p className="mt-1 text-xs text-[#75849a]">
                    Perguntas repetíveis para coletar contexto, não para fechar
                    arquitetura ou escopo.
                  </p>
                </div>
                <div className="divide-y divide-[#e5eaf0]">
                  {questions.map(({ track, question }, index) => (
                    <div key={`${track.id}-${question}`} className="p-5 md:p-6">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#edf2f7] font-mono text-[10px] text-[#65758a]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium leading-6 text-[#24364e]">
                              {question}
                            </p>
                            <Badge
                              variant="secondary"
                              className="bg-[#f1f4f7] text-[10px] text-[#68798e]"
                            >
                              {track.name}
                            </Badge>
                          </div>
                          <Textarea
                            value={answers[question] ?? ""}
                            onChange={(event) =>
                              setAnswers((current) => ({
                                ...current,
                                [question]: event.target.value,
                              }))
                            }
                            placeholder="Registre a resposta do cliente ou escreva “não sabe”."
                            className="mt-3 min-h-20 resize-y bg-[#fbfcfd]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {analyzed && (
              <Card className="gap-0 overflow-hidden border-[#b8ddcc] py-0 shadow-none">
                <div className="border-b border-[#d7ebe2] bg-[#eef9f4] px-5 py-5 md:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#468168]">Saída padrão da primeira reunião</p>
                      <p className="mt-1 text-lg font-semibold text-[#17382b]">Sempre os mesmos blocos. Sempre uma próxima ação.</p>
                    </div>
                    <Badge className="bg-[#d9f0e5] text-[#286149]">{maturity}</Badge>
                  </div>
                </div>
                <CardContent className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
                  <div className="rounded-2xl border border-[#dce5e0] bg-white p-4">
                    <p className="text-sm font-semibold text-[#24364e]">Resumo para fomentar o CRM</p>
                    <p className="mt-2 text-xs leading-5 text-[#718196]">Objetivo, cenário, pessoas, tecnologia, prazo, lacunas e encaminhamento em uma ordem fixa.</p>
                    <Button onClick={() => copyOutput("crm", crmOutput)} className="mt-4 w-full bg-[#17395d] hover:bg-[#234d78]">
                      {copied === "crm" ? <Check /> : <ClipboardPaste />} {copied === "crm" ? "Resumo copiado" : "Copiar resumo para CRM"}
                    </Button>
                  </div>
                  <div className="rounded-2xl border border-[#dce5e0] bg-white p-4">
                    <p className="text-sm font-semibold text-[#24364e]">Handoff para Engenharia</p>
                    <p className="mt-2 text-xs leading-5 text-[#718196]">Entrega contexto, respostas técnicas e expectativa da próxima conversa sem recomeçar do zero.</p>
                    <Button onClick={() => copyOutput("engineering", engineeringOutput)} disabled={!selected.length} variant="outline" className="mt-4 w-full border-[#9abbd8] text-[#17395d]">
                      {copied === "engineering" ? <Check /> : <Users />} {copied === "engineering" ? "Handoff copiado" : "Copiar handoff técnico"}
                    </Button>
                  </div>
                  <div className="rounded-2xl bg-[#102235] p-4 text-white md:col-span-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#70d7a9]">Próxima ação recomendada</p>
                    <p className="mt-2 text-sm leading-6 text-[#dbe7f4]">{nextAction}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <Card className="gap-4 border-[#1f3550] bg-[#0e1b2b] py-5 text-white shadow-none">
              <CardHeader className="px-5">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-[#53d8a0]" />
                  <CardTitle className="text-sm">Quem chamar</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-5">
                {selected.length ? (
                  selected.map((track) => (
                    <div key={track.id} className="rounded-xl bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-[.14em] text-[#71849b]">
                        {track.name}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#dbe7f4]">
                        {track.specialist}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs leading-5 text-[#8192a7]">
                    Registre o contexto ou comece pelas cinco perguntas para receber a indicação.
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="gap-3 border-[#dce3eb] py-5 shadow-none">
              <CardHeader className="px-5">
                <CardTitle className="text-sm text-[#1d3048]">
                  Preparar o próximo passo
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 text-xs leading-5 text-[#6d7d92]">
                {nextAction} “Não sei” é uma resposta válida: ela vira uma lacuna explícita, não uma informação inventada.
                <Button
                  onClick={beginTechnicalDiscovery}
                  disabled={!selected.length || !technicalAnswered}
                  className="mt-4 w-full bg-[#17395d] hover:bg-[#234d78]"
                >
                  Levar para discovery técnico <ArrowRight />
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}

function Overview({
  onStart,
  onQualify,
}: {
  onStart: () => void;
  onQualify: () => void;
}) {
  return (
    <>
      <Header
        eyebrow="Seu laboratório de arquitetura"
        title="Transforme perguntas soltas em uma jornada arquitetural"
        description="Conduza o discovery, enxergue lacunas e aprenda por que cada informação importa — sem aplicar TOGAF como cerimônia nem C4 como desenho decorativo."
      />
      <div className="grid-gap relative flex-1 p-5 md:p-8">
        <section className="overflow-hidden rounded-[28px] border border-[#1e3552] bg-[#0c1929] text-white shadow-[0_24px_80px_rgba(15,31,53,.16)]">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <div className="p-7 md:p-10">
              <Badge className="border border-[#326395] bg-[#153556] text-[#a9d3ff]">
                TOGAF × C4 × Discovery
              </Badge>
              <h2 className="mt-6 max-w-xl text-4xl font-semibold tracking-[-.045em] md:text-5xl">
                Entenda o cenário.
                <br />
                Desenhe a mudança.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#9fb0c4] md:text-base">
                Escolha as frentes técnicas, percorra Objetivo → AS-IS → Gaps →
                TO-BE → Transição → Governança e gere apenas os níveis C4 que
                agregam valor.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  onClick={onQualify}
                  className="h-11 bg-[#5aa8ff] px-5 text-[#07111f] hover:bg-[#7bbaff]"
                >
                  Qualificar oportunidade <ArrowRight />
                </Button>
                <Button
                  onClick={onStart}
                  variant="outline"
                  className="h-11 border-[#37516f] bg-transparent px-5 text-[#bfd1e4] hover:bg-white/5 hover:text-white"
                >
                  Ir direto ao discovery
                </Button>
              </div>
            </div>
            <div className="relative min-h-[310px] border-t border-white/8 bg-[#0a1523] p-7 lg:border-l lg:border-t-0">
              <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(104,151,205,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(104,151,205,.15)_1px,transparent_1px)] [background-size:28px_28px]" />
              <div className="relative mx-auto flex h-full max-w-md flex-col justify-center">
                <div className="rounded-2xl border border-[#355170] bg-[#101f31] p-4 shadow-xl">
                  <p className="text-[10px] uppercase tracking-[.2em] text-[#6f9dcc]">
                    Sistema em foco
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-[#193b60]">
                      <AppWindow className="text-[#74b5f9]" />
                    </div>
                    <div>
                      <p className="font-medium">Plataforma atual</p>
                      <p className="text-xs text-[#7f91a7]">
                        Aplicações, dados e operação
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mx-auto h-8 w-px bg-[#355170]" />
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["Gaps", Route],
                    ["TO-BE", Building2],
                    ["Roadmap", Workflow],
                  ].map(([label, Icon]) => (
                    <div
                      key={label as string}
                      className="rounded-xl border border-[#263e59] bg-[#0e1c2c] p-3 text-center"
                    >
                      <Icon className="mx-auto size-4 text-[#53d8a0]" />
                      <p className="mt-2 text-[11px] text-[#a6b4c5]">
                        {label as string}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            {
              number: "01",
              title: "Perguntas que se adaptam",
              text: "As trilhas escolhidas revelam somente as perguntas relevantes para o cenário.",
              icon: GitBranch,
            },
            {
              number: "02",
              title: "Método visível",
              text: "Cada resposta mostra qual fase, artefato e decisão arquitetural ela alimenta.",
              icon: GraduationCap,
            },
            {
              number: "03",
              title: "Zoom com propósito",
              text: "Context, Container, Component e Deployment entram apenas quando contam uma história útil.",
              icon: Box,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.number}
                className="gap-4 border-[#dde4ec] bg-white py-5 shadow-none"
              >
                <CardHeader className="px-5">
                  <div className="flex items-center justify-between">
                    <Icon className="size-5 text-[#337fca]" />
                    <span className="font-mono text-xs text-[#a0adbb]">
                      {item.number}
                    </span>
                  </div>
                  <CardTitle className="mt-4 text-lg text-[#17283f]">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 text-sm leading-6 text-[#65758a]">
                  {item.text}
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </>
  );
}

function DiscoveryWorkspace({
  draft,
  onChange,
}: {
  draft: DiscoveryDraft;
  onChange: (draft: DiscoveryDraft) => void;
}) {
  const [phase, setPhase] = useState("asis");
  const [openNote, setOpenNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const selectedTracks = draft.tracks;
  const selected = tracks.filter((track) => selectedTracks.includes(track.id));
  const questions = selected.flatMap((track) =>
    track.questions.map((question) => ({ track, question })),
  );
  const coverage = discoveryCoverage([...questions.map(({ question }) => question), ...Object.values(phaseQuestions)], draft.answers);
  const completed = coverage.percent;
  const toggleTrack = (id: string) =>
    onChange({
      ...draft,
      tracks: selectedTracks.includes(id)
        ? selectedTracks.filter((item) => item !== id)
        : [...selectedTracks, id],
    });
  const updateField = (field: "title" | "outcome" | "problem", value: string) =>
    onChange({ ...draft, [field]: value });
  const updateAnswer = (question: string, value: string) =>
    onChange({ ...draft, answers: { ...draft.answers, [question]: value } });
  const saveDiscovery = async () => {
    if (!draft.title.trim()) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const saved = saveLocalDiscovery(window.localStorage, draft);
      onChange({
        ...saved,
        tracks: saved.tracks ?? [],
        answers: saved.answers ?? {},
      });
      setSaveMessage("Salvo neste navegador");
    } catch {
      setSaveMessage("Não foi possível salvar neste navegador. Mantenha a página aberta e verifique o armazenamento local.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header
        eyebrow="Workspace guiado"
        title="Novo discovery"
        description="Defina o contexto, selecione as frentes e deixe o roteiro se adaptar. Nada vira fato confirmado sem uma resposta explícita."
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            <Card className="gap-5 border-[#dce3eb] py-5 shadow-none">
              <CardHeader className="px-5 md:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg text-[#17283f]">
                      Contexto inicial
                    </CardTitle>
                    <CardDescription className="mt-2">
                      O suficiente para orientar a descoberta, não para fingir
                      que o escopo já existe.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs ${saveMessage.startsWith("Falha") ? "text-[#b53d4a]" : "text-[#45806b]"}`}
                    >
                      {saveMessage}
                    </span>
                    <Button
                      onClick={saveDiscovery}
                      disabled={saving || !draft.title.trim()}
                      size="sm"
                      className="bg-[#17395d] hover:bg-[#234d78]"
                    >
                      {saving ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <Save />
                      )}{" "}
                      Salvar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 px-5 md:grid-cols-2 md:px-6">
                <label className="space-y-2 text-xs font-medium text-[#52657d]">
                  Cliente ou oportunidade
                  <Input
                    value={draft.title}
                    onChange={(event) =>
                      updateField("title", event.target.value)
                    }
                    placeholder="Ex.: Modernização da plataforma"
                    className="h-10 bg-[#fbfcfd]"
                  />
                </label>
                <label className="space-y-2 text-xs font-medium text-[#52657d]">
                  Resultado esperado
                  <Input
                    value={draft.outcome}
                    onChange={(event) =>
                      updateField("outcome", event.target.value)
                    }
                    placeholder="Ex.: Reduzir risco e preparar migração"
                    className="h-10 bg-[#fbfcfd]"
                  />
                </label>
                <label className="space-y-2 text-xs font-medium text-[#52657d] md:col-span-2">
                  Problema que disparou o discovery
                  <Textarea
                    value={draft.problem}
                    onChange={(event) =>
                      updateField("problem", event.target.value)
                    }
                    placeholder="Descreva a cena, a dor e por que isso precisa mudar agora..."
                    className="min-h-24 resize-y bg-[#fbfcfd]"
                  />
                </label>
              </CardContent>
            </Card>
            <Card className="gap-5 border-[#dce3eb] py-5 shadow-none">
              <CardHeader className="px-5 md:px-6">
                <CardTitle className="text-lg text-[#17283f]">
                  Quais frentes participam?
                </CardTitle>
                <CardDescription>
                  Combine trilhas. Perguntas transversais aparecerão uma única
                  vez.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 px-5 md:grid-cols-2 md:px-6">
                {tracks.map((track) => {
                  const Icon = track.icon;
                  const checked = selectedTracks.includes(track.id);
                  return (
                    <label
                      key={track.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${checked ? "border-[#82b9ee] bg-[#f0f7ff] shadow-[0_0_0_1px_rgba(73,140,205,.08)]" : "border-[#e1e7ed] bg-white hover:border-[#b7c6d6]"}`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleTrack(track.id)}
                        className="mt-0.5"
                      />
                      <span
                        className="grid size-8 shrink-0 place-items-center rounded-lg"
                        style={{
                          backgroundColor: `${track.color}20`,
                          color: track.color,
                        }}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-[#23344b]">
                          {track.name}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[#718196]">
                          {track.short}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </CardContent>
            </Card>
            <Tabs value={phase} onValueChange={setPhase}>
              <div className="overflow-x-auto pb-1">
                <TabsList
                  variant="line"
                  className="min-w-max border-b border-[#dfe6ed]"
                >
                  {phases.map((item) => (
                    <TabsTrigger
                      key={item.id}
                      value={item.id}
                      className="px-4 py-3"
                    >
                      {item.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {phases.map((item) => (
                <TabsContent key={item.id} value={item.id} className="mt-4">
                  <Card className="gap-0 overflow-hidden border-[#dce3eb] py-0 shadow-none">
                    <div className="border-b border-[#e1e7ed] bg-[#f7f9fb] px-5 py-4 md:px-6">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-[#e4f1ff] text-[#337fca]">
                          <item.icon className="size-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1d3048]">
                            {item.name}: {item.subtitle}
                          </p>
                          <p className="text-xs text-[#75849a]">
                            Perguntas guiadas pelas trilhas selecionadas
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-[#e5eaf0]">
                      {(item.id === "asis"
                        ? questions
                        : [
                            {
                              track: selected[0] ?? tracks[0],
                              question: phaseQuestions[item.id],
                            },
                          ]
                      ).map(({ track, question }, index) => {
                        const note = learningNotes[question];
                        return (
                          <div
                            key={`${question}-${index}`}
                            className="p-5 md:p-6"
                          >
                            <div className="flex items-start gap-3">
                              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#edf2f7] font-mono text-[10px] text-[#65758a]">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-medium leading-6 text-[#24364e]">
                                    {question}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className="bg-[#f1f4f7] text-[10px] text-[#68798e]"
                                  >
                                    {track.name}
                                  </Badge>
                                </div>
                                <Textarea
                                  value={draft.answers[question] ?? ""}
                                  onChange={(event) =>
                                    updateAnswer(question, event.target.value)
                                  }
                                  placeholder="Registre fato, fonte e contexto. Se não souber, marque como lacuna."
                                  className="mt-3 min-h-20 resize-y bg-[#fbfcfd]"
                                />
                                <button
                                  onClick={() =>
                                    setOpenNote(
                                      openNote === question ? null : question,
                                    )
                                  }
                                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#337fca] hover:text-[#175c9f]"
                                >
                                  <CircleHelp className="size-3.5" /> Por que
                                  perguntamos isso?{" "}
                                  <ChevronRight
                                    className={`size-3 transition ${openNote === question ? "rotate-90" : ""}`}
                                  />
                                </button>
                                {openNote === question && (
                                  <div className="mt-3 grid gap-3 rounded-xl border border-[#cfe1f2] bg-[#f2f8fe] p-4 text-xs leading-5 text-[#52677d] md:grid-cols-2">
                                    <div>
                                      <p className="font-semibold text-[#245d91]">
                                        Intenção
                                      </p>
                                      <p className="mt-1">
                                        {note?.why ??
                                          "Conecta a resposta ao objetivo da fase e evita decisões sem evidência."}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-[#245d91]">
                                        TOGAF adaptado
                                      </p>
                                      <p className="mt-1">
                                        {note?.togaf ??
                                          `${item.name}: produz evidência para baseline, gap ou target.`}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-[#245d91]">
                                        Leitura C4
                                      </p>
                                      <p className="mt-1">
                                        {note?.c4 ??
                                          "Pode alterar pessoas, sistemas, containers, relações ou nós de deployment."}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-[#245d91]">
                                        Boa resposta
                                      </p>
                                      <p className="mt-1">
                                        {note?.good ??
                                          "Seja específica, identifique fonte, responsável, ambiente e o que ainda precisa ser confirmado."}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <Card className="gap-4 border-[#1f3550] bg-[#0e1b2b] py-5 text-white shadow-none">
              <CardHeader className="px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    Cobertura do discovery
                  </CardTitle>
                  <span className="font-mono text-xs text-[#78b8f6]">
                    {completed}%
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-5">
                <Progress
                  value={completed}
                  className="bg-[#22364e] [&_[data-slot=progress-indicator]]:bg-[#53d8a0]"
                />
                <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-[#75879d]">Trilhas</p>
                    <p className="mt-1 text-xl font-semibold">
                      {selected.length}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-[#75879d]">Perguntas</p>
                    <p className="mt-1 text-xl font-semibold">
                      {coverage.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <C4MiniMap selected={selected} />
            <Card className="gap-3 border-[#dce3eb] py-5 shadow-none">
              <CardHeader className="px-5">
                <CardTitle className="text-sm text-[#1d3048]">
                  Próxima lacuna relevante
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 text-xs leading-5 text-[#6d7d92]">
                {coverage.missing[0] ?? "Todas as perguntas aplicáveis foram preenchidas. Revise as evidências antes de avançar."}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}

function C4MiniMap({ selected }: { selected: Track[] }) {
  return (
    <Card className="gap-4 overflow-hidden border-[#dce3eb] py-5 shadow-none">
      <CardHeader className="px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-[#1d3048]">
            C4 · leitura provisória
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <button aria-label="Sobre a leitura C4">
                <CircleHelp className="size-4 text-[#91a0b2]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              O mapa muda conforme as trilhas e respostas.
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="px-5">
        <div className="rounded-xl border border-[#dce5ee] bg-[#f5f8fb] p-3">
          <div className="mx-auto max-w-[220px] rounded-lg border border-dashed border-[#8da5be] bg-white p-3 text-center">
            <p className="text-[10px] uppercase tracking-[.16em] text-[#8291a3]">
              System in scope
            </p>
            <p className="mt-1 text-xs font-semibold text-[#32465f]">
              Solução a descobrir
            </p>
          </div>
          <div className="mx-auto h-5 w-px bg-[#b9c5d2]" />
          {selected.length ? (
            <div className="grid grid-cols-2 gap-2">
              {selected.slice(0, 4).map((track) => (
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
          Não é um diagrama final. É um lembrete visual do que ainda precisa ser
          confirmado.
        </p>
      </CardContent>
    </Card>
  );
}

function SavedProjects({
  onOpen,
  onNew,
}: {
  onOpen: (draft: DiscoveryDraft) => void;
  onNew: () => void;
}) {
  const [projects, setProjects] = useState<DiscoveryDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setProjects(listDiscoveries(window.localStorage));
    } catch {
      setError("Não foi possível ler os projetos deste navegador. Os dados existentes foram preservados.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <Header
        eyebrow="Memória do workspace"
        title="Projetos salvos"
        description="Projetos salvos somente neste navegador. Reabra para continuar; limpar os dados do navegador remove esses projetos."
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="mb-5 flex justify-end">
          <Button onClick={onNew} className="bg-[#17395d] hover:bg-[#234d78]">
            <Plus /> Novo discovery
          </Button>
        </div>
        {loading ? (
          <div className="grid min-h-52 place-items-center rounded-2xl border border-[#dce3eb] bg-white text-sm text-[#718196]">
            <LoaderCircle className="mr-2 inline size-4 animate-spin" />{" "}
            Carregando projetos
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#edc9ce] bg-[#fff7f8] p-5 text-sm text-[#a04450]">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cbd6e1] bg-white p-10 text-center">
            <FolderOpen className="mx-auto size-8 text-[#8da0b5]" />
            <h2 className="mt-4 font-semibold text-[#23364f]">
              Nenhum discovery salvo ainda
            </h2>
            <p className="mt-2 text-sm text-[#718196]">
              Crie o primeiro projeto e use o botão Salvar no contexto inicial.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="gap-4 border-[#dce3eb] py-5 shadow-none"
              >
                <CardHeader className="px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg text-[#1d3048]">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {project.outcome || "Resultado ainda não informado"}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-[#b7d5f2] bg-[#edf6ff] text-[#2b70b2]"
                    >
                      Rascunho
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-5">
                  <div className="flex flex-wrap gap-2">
                    {(project.tracks ?? []).map((id) => (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="bg-[#f0f3f6] text-[#65758a]"
                      >
                        {tracks.find((track) => track.id === id)?.name ?? id}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={() => onOpen(project)}
                    variant="outline"
                    className="mt-5 w-full border-[#b8c9da] text-[#234e78]"
                  >
                    Abrir e continuar <ArrowRight />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function TogafGuide() {
  const texts = [
    "Alinha motivadores, stakeholders, resultado esperado, escopo inicial e critérios de sucesso.",
    "Documenta a baseline relevante de negócio, aplicações, dados e tecnologia, distinguindo fato de lacuna.",
    "Compara baseline e target para revelar capacidades ausentes, riscos, restrições e dependências.",
    "Descreve as capacidades e fronteiras do cenário-alvo sem antecipar detalhes que ainda não têm evidência.",
    "Organiza ondas, quick wins, dependências e estados intermediários para tornar a mudança executável.",
    "Registra decisões, princípios, responsáveis, critérios e mecanismos de acompanhamento da arquitetura.",
  ];
  return (
    <>
      <Header
        eyebrow="Método como bússola"
        title="Jornada TOGAF adaptada ao discovery"
        description="Uma aplicação pragmática do raciocínio arquitetural. O Site não reproduz o ADM completo nem substitui governança formal."
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="grid gap-4 lg:grid-cols-2">
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            return (
              <Card
                key={phase.id}
                className="gap-4 border-[#dce3eb] py-5 shadow-none"
              >
                <CardHeader className="px-5">
                  <div className="flex items-start gap-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf4fe] text-[#337fca]">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#8b9aac]">
                        Etapa {String(index + 1).padStart(2, "0")}
                      </p>
                      <CardTitle className="mt-1 text-lg text-[#1d3048]">
                        {phase.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {phase.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-5 text-sm leading-6 text-[#65758a]">
                  {texts[index]}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-5 rounded-2xl border border-[#cfe0f0] bg-[#edf6ff] p-5 text-sm leading-6 text-[#45627e]">
          <strong className="text-[#245d91]">Regra do Lab:</strong> usar o
          mínimo de método necessário para reduzir ambiguidade. O nome TOGAF
          aparece para ensinar a lente; o discovery continua orientado à
          decisão.
        </div>
      </div>
    </>
  );
}

function C4Guide() {
  const levels = [
    {
      name: "Context",
      subtitle: "O sistema no mundo",
      icon: Network,
      text: "Pessoas, sistema em foco e sistemas externos. É o ponto de partida para alinhar fronteiras e relações.",
    },
    {
      name: "Container",
      subtitle: "Aplicações e data stores",
      icon: Box,
      text: "Mostra responsabilidades, tecnologias e comunicação dentro de um único software system.",
    },
    {
      name: "Component",
      subtitle: "Estruturas internas relevantes",
      icon: Braces,
      text: "Abre um container somente quando seus componentes ajudam uma decisão ou explicam um risco.",
    },
    {
      name: "Code",
      subtitle: "Implementação",
      icon: Code2,
      text: "Raramente necessário em pré-vendas. Entra apenas quando o discovery exige desenho próximo do código.",
    },
    {
      name: "Deployment",
      subtitle: "Software na infraestrutura",
      icon: ServerCog,
      text: "Conecta instâncias a ambientes, nós, redes, load balancers e demais elementos de infraestrutura.",
    },
  ];
  return (
    <>
      <Header
        eyebrow="Zoom com intenção"
        title="Modelos C4"
        description="C4 é hierárquico, mas não obriga usar todos os níveis. Context e Container resolvem a maior parte das conversas; Deployment complementa a visão de infraestrutura."
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {levels.map((level, index) => {
            const Icon = level.icon;
            return (
              <Card
                key={level.name}
                className={`gap-4 border-[#dce3eb] py-5 shadow-none ${index === 4 ? "md:col-span-2 xl:col-span-1" : ""}`}
              >
                <CardHeader className="px-5">
                  <div className="flex items-center justify-between">
                    <div className="grid size-10 place-items-center rounded-xl bg-[#111f31] text-[#75b7f8]">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-mono text-xs text-[#a1adba]">
                      C{index < 4 ? index + 1 : "+"}
                    </span>
                  </div>
                  <CardTitle className="mt-4 text-lg text-[#1d3048]">
                    {level.name}
                  </CardTitle>
                  <CardDescription>{level.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="px-5 text-sm leading-6 text-[#65758a]">
                  {level.text}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}

function TrackGallery({
  selectedTracks,
  setSelectedTracks,
  onStart,
}: {
  selectedTracks: string[];
  setSelectedTracks: (tracks: string[]) => void;
  onStart: () => void;
}) {
  return (
    <>
      <Header
        eyebrow="Questionários condicionais"
        title="Trilhas técnicas"
        description="Cada trilha adiciona perguntas próprias e reutiliza blocos transversais de segurança, rede, observabilidade, continuidade e operação."
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tracks.map((track) => {
            const Icon = track.icon;
            const active = selectedTracks.includes(track.id);
            return (
              <button
                key={track.id}
                onClick={() =>
                  setSelectedTracks(
                    active
                      ? selectedTracks.filter((id) => id !== track.id)
                      : [...selectedTracks, track.id],
                  )
                }
                className={`rounded-2xl border p-5 text-left transition ${active ? "border-[#78afe5] bg-[#f0f7ff]" : "border-[#dce3eb] bg-white hover:-translate-y-0.5 hover:border-[#aebdcd]"}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="grid size-10 place-items-center rounded-xl"
                    style={{
                      backgroundColor: `${track.color}20`,
                      color: track.color,
                    }}
                  >
                    <Icon className="size-5" />
                  </span>
                  {active && (
                    <span className="grid size-6 place-items-center rounded-full bg-[#337fca] text-white">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </div>
                <h3 className="mt-5 font-semibold text-[#1d3048]">
                  {track.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#69798e]">
                  {track.short}
                </p>
                <p className="mt-4 text-xs font-medium text-[#337fca]">
                  {track.questions.length} blocos iniciais · expansível
                </p>
              </button>
            );
          })}
        </div>
        <Button
          onClick={onStart}
          className="mt-6 bg-[#17395d] hover:bg-[#234d78]"
        >
          Usar trilhas selecionadas <ArrowRight />
        </Button>
      </div>
    </>
  );
}

function Glossary() {
  const terms = [
    [
      "Baseline / AS-IS",
      "Descrição relevante do estado atual, sustentada por evidência.",
    ],
    [
      "Target / TO-BE",
      "Estado futuro desejado e as capacidades necessárias para alcançá-lo.",
    ],
    [
      "Gap",
      "Diferença entre baseline e target que exige mudança, decisão ou validação.",
    ],
    [
      "Container (C4)",
      "Aplicação ou data store; não significa necessariamente container Docker.",
    ],
    [
      "Boundary",
      "Fronteira de responsabilidade ou escopo que ajuda a deixar ownership explícito.",
    ],
    [
      "Deployment node",
      "Local onde uma instância de sistema ou container é executada.",
    ],
    [
      "Premissa",
      "Afirmação ainda não confirmada adotada temporariamente para avançar.",
    ],
    [
      "Restrição",
      "Condição que limita opções de arquitetura, prazo, tecnologia ou operação.",
    ],
  ];
  return (
    <>
      <Header
        eyebrow="Linguagem compartilhada"
        title="Glossário prático"
        description="Conceitos usados pelo Lab, traduzidos para o contexto de discovery e pré-vendas."
      />
      <div className="flex-1 p-5 md:p-8">
        <div className="overflow-hidden rounded-2xl border border-[#dce3eb] bg-white">
          {terms.map(([term, meaning], index) => (
            <div
              key={term}
              className={`grid gap-2 p-5 md:grid-cols-[220px_1fr] ${index ? "border-t border-[#e3e8ee]" : ""}`}
            >
              <p className="font-semibold text-[#23364f]">{term}</p>
              <p className="text-sm leading-6 text-[#69798e]">{meaning}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [draft, setDraft] = useState<DiscoveryDraft>({
    title: "",
    outcome: "",
    problem: "",
    tracks: [],
    answers: {},
    status: "draft",
  });
  const newDiscovery = () => {
    setDraft({
      title: "",
      outcome: "",
      problem: "",
      tracks: [],
      answers: {},
      status: "draft",
    });
    setView("discovery");
  };
  const navigate = (next: View) => {
    setView(next);
  };
  const content = useMemo(() => {
    if (view === "overview")
      return (
        <Overview
          onStart={newDiscovery}
          onQualify={() => setView("qualify")}
        />
      );
    if (view === "qualify")
      return (
        <QualificationWorkspace
          onStartDiscovery={(qualifiedDraft) => {
            setDraft(qualifiedDraft);
            setView("discovery");
          }}
        />
      );
    if (view === "discovery")
      return <DiscoveryWorkspace draft={draft} onChange={setDraft} />;
    if (view === "saved")
      return (
        <SavedProjects
          onNew={newDiscovery}
          onOpen={(project) => {
            setDraft({
              ...project,
              tracks: project.tracks ?? [],
              answers: project.answers ?? {},
            });
            setView("discovery");
          }}
        />
      );
    if (view === "togaf") return <TogafGuide />;
    if (view === "c4") return <C4Guide />;
    if (view === "tracks")
      return (
        <TrackGallery
          selectedTracks={draft.tracks}
          setSelectedTracks={(trackIds) =>
            setDraft({ ...draft, tracks: trackIds })
          }
          onStart={() => setView("discovery")}
        />
      );
    return <Glossary />;
  }, [view, draft]);
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar active={view} onNavigate={navigate} />
        <SidebarInset className="min-h-svh bg-[#f4f6f8] text-[#17283f]">
          {content}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
