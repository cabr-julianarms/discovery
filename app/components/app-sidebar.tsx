import { BookOpen, Box, Braces, FolderOpen, GraduationCap, LayoutDashboard, Network, Plus, Route, UserRoundSearch } from "lucide-react";
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

export type View = "overview" | "qualify" | "discovery" | "saved" | "togaf" | "c4" | "tracks" | "glossary";

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
      { id: "tracks", label: "Trilhas técnicas", icon: Network },
      { id: "glossary", label: "Glossário", icon: BookOpen },
    ],
  },
];

export const viewIds = groups.flatMap((group) => group.items.map((item) => item.id));

export function AppSidebar({ active, onNavigate }: { active: View; onNavigate: (view: View) => void }) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <Sidebar collapsible="icon" className="border-r border-white/8">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#5aa8ff] text-[#07111f] shadow-[0_0_28px_rgba(90,168,255,.26)]">
            <Braces className="size-5" />
          </div>
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <p className="truncate font-semibold tracking-tight">Discovery Lab</p>
            <p className="truncate text-[11px] uppercase tracking-[.18em] text-[#7f8da3]">Architecture workspace</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[.2em] text-[#627087]">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={active === item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          if (isMobile) setOpenMobile(false);
                        }}
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
        ))}
      </SidebarContent>
      <div className="m-3 rounded-xl border border-[#25364d] bg-[#101c2c] p-3 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-2 text-xs font-medium text-[#b9c8da]">
          <GraduationCap className="size-4 text-[#53d8a0]" /> Modo aprendizado ativo
        </div>
        <p className="mt-2 text-[11px] leading-5 text-[#74849a]">Cada pergunta explica método, artefato e nível C4.</p>
      </div>
    </Sidebar>
  );
}
