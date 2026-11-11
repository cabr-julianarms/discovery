import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { loadJson, storeJson } from "@/lib/browser";
import { emptyDraft, type DiscoveryDraft } from "@/lib/local-discoveries";
import { emptyQualification, type QualificationState } from "@/lib/qualification";
import { AppSidebar, viewIds, type View } from "./components/app-sidebar";
import { DiscoveryView } from "./views/discovery";
import { C4GuideView, GlossaryView, TogafGuideView, TracksGuideView } from "./views/guides";
import { OverviewView } from "./views/overview";
import { QualifyView } from "./views/qualify";
import { SavedProjectsView } from "./views/saved-projects";

// Rascunhos de trabalho: sobrevivem a recarregar a página, só neste navegador.
const KEYS = {
  view: "discovery-architecture-lab:view:v1",
  qualification: "discovery-architecture-lab:qualification:v1",
  draft: "discovery-architecture-lab:draft:v1",
};

function initialView(): View {
  const stored = loadJson<{ view?: string }>(KEYS.view, {}).view;
  return viewIds.includes(stored as View) ? (stored as View) : "overview";
}

export default function App() {
  const [view, setView] = useState<View>(initialView);
  const [qualification, setQualification] = useState<QualificationState>(() => loadJson(KEYS.qualification, emptyQualification()));
  const [draft, setDraft] = useState<DiscoveryDraft>(() => loadJson(KEYS.draft, emptyDraft()));

  useEffect(() => {
    storeJson(KEYS.view, { view });
    window.scrollTo({ top: 0 });
  }, [view]);
  useEffect(() => {
    storeJson(KEYS.qualification, qualification);
  }, [qualification]);
  useEffect(() => {
    storeJson(KEYS.draft, draft);
  }, [draft]);

  const openDiscovery = (next: DiscoveryDraft) => {
    setDraft({ ...next, tracks: next.tracks ?? [], answers: next.answers ?? {} });
    setView("discovery");
  };
  const newDiscovery = () => openDiscovery(emptyDraft());

  const content = (() => {
    switch (view) {
      case "overview":
        return <OverviewView onStart={newDiscovery} onQualify={() => setView("qualify")} />;
      case "qualify":
        return (
          <QualifyView
            state={qualification}
            onChange={setQualification}
            onReset={() => setQualification(emptyQualification())}
            onStartDiscovery={openDiscovery}
          />
        );
      case "discovery":
        return <DiscoveryView draft={draft} onChange={setDraft} onNew={newDiscovery} />;
      case "saved":
        return (
          <SavedProjectsView
            onOpen={openDiscovery}
            onNew={newDiscovery}
            onDeleted={(id) => {
              if (draft.id === id) setDraft(emptyDraft());
            }}
          />
        );
      case "togaf":
        return <TogafGuideView />;
      case "c4":
        return <C4GuideView />;
      case "tracks":
        return (
          <TracksGuideView
            selectedTracks={draft.tracks}
            setSelectedTracks={(trackIds) => setDraft({ ...draft, tracks: trackIds })}
            onStart={() => setView("discovery")}
          />
        );
      default:
        return <GlossaryView />;
    }
  })();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar active={view} onNavigate={setView} />
        <SidebarInset className="min-h-svh bg-[#f4f6f8] text-[#17283f]">{content}</SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
