import {
  BookOpen,
  Box,
  Braces,
  FolderOpen,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Network,
  Plus,
  Route,
  Shuffle,
  UserRoundSearch,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export type View =
  | "overview"
  | "qualify"
  | "discovery"
  | "saved"
  | "togaf"
  | "c4"
  | "pillars"
  | "migration"
  | "tracks"
  | "glossary";

const groups: { label: string; items: { id: View; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    label: "Workspace",
    items: [
      { id: "overview", label: "Visão geral", icon: LayoutDashboard },
      { id: "qualify", label: "Qualificar oportunidade", icon: UserRoundSearch },
      { id: "discovery", label: "Discovery atual", icon: Plus },
      { id: "saved", label: "Projetos salvos", icon: FolderOpen },
    ],
  },
  {
    label: "Aprender",
    items: [
      { id: "togaf", label: "Jornada TOGAF", icon: Route },
      { id: "c4", label: "Modelos C4", icon: Box },
      { id: "pillars", label: "Architecture Framework", icon: Layers },
      { id: "migration", label: "Estratégias de migração", icon: Shuffle },
      { id: "tracks", label: "Trilhas técnicas", icon: Network },
      { id: "glossary", label: "Glossário", icon: BookOpen },
    ],
  },
];

export const viewIds = groups.flatMap((group) => group.items.map((item) => item.id));

export function AppSidebar({
  active,
  onNavigate,
  currentTitle,
}: {
  active: View;
  onNavigate: (view: View) => void;
  currentTitle?: string;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <Sidebar collapsible="icon" className="border-r border-navy-line">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky text-navy shadow-[0_0_24px_rgba(90,168,255,.28)]">
            <Braces className="size-5" />
          </div>
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <p className="truncate font-semibold tracking-tight text-white">Discovery Lab</p>
            <p className="truncate text-[11px] uppercase tracking-[.16em] text-navy-muted">Architecture workspace</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[.18em] text-navy-muted/80">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.id;
                  const subtitle = item.id === "discovery" && currentTitle ? currentTitle : undefined;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={isActive}
                        onClick={() => {
                          onNavigate(item.id);
                          if (isMobile) setOpenMobile(false);
                        }}
                        className={`relative cursor-pointer text-navy-text/85 hover:bg-navy-2 hover:text-white data-[active=true]:bg-navy-2 data-[active=true]:font-medium data-[active=true]:text-white ${subtitle ? "h-12" : "h-9"}`}
                      >
                        {isActive && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-sky group-data-[collapsible=icon]:hidden" />}
                        <Icon className={isActive ? "text-sky" : "text-navy-muted"} />
                        <span className="min-w-0">
                          <span className="block truncate">{item.label}</span>
                          {subtitle && <span className="block truncate text-[11px] font-normal text-navy-muted">{subtitle}</span>}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <div className="m-3 rounded-xl border border-navy-line bg-navy-2/60 p-3 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-2 text-xs font-medium text-navy-text">
          <GraduationCap className="size-4 text-mint" /> Modo aprendizado
        </div>
        <p className="mt-1.5 text-[11px] leading-5 text-navy-muted">Cada pergunta explica método, artefato e nível C4.</p>
      </div>
    </Sidebar>
  );
}
