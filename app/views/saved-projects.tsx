import { useRef, useState } from "react";
import { ArrowRight, Download, FolderOpen, Plus, Sparkles, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tracks } from "@/config/tracks";
import { downloadText } from "@/lib/browser";
import {
  deleteDiscovery,
  exportDiscoveries,
  importDiscoveries,
  listDiscoveries,
  type DiscoveryDraft,
} from "@/lib/local-discoveries";
import { PageHeader } from "../components/page-header";

function load(): { projects: DiscoveryDraft[]; error: string } {
  try {
    return { projects: listDiscoveries(window.localStorage), error: "" };
  } catch {
    return { projects: [], error: "Não foi possível ler os projetos deste navegador. Os dados existentes foram preservados." };
  }
}

const fileDate = () => new Date().toISOString().slice(0, 10);
const slug = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "projeto";

export function SavedProjectsView({
  onOpen,
  onNew,
  onDeleted,
}: {
  onOpen: (draft: DiscoveryDraft) => void;
  onNew: () => void;
  onDeleted: (id: string) => void;
}) {
  const [{ projects, error }, setData] = useState(load);
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const remove = (project: DiscoveryDraft) => {
    if (!window.confirm(`Excluir “${project.title}” deste navegador? Isso não pode ser desfeito.`)) return;
    deleteDiscovery(window.localStorage, project.id!);
    onDeleted(project.id!);
    setData(load());
  };

  const exportOne = (project: DiscoveryDraft) =>
    downloadText(`discovery-${slug(project.title)}-${fileDate()}.json`, exportDiscoveries(window.localStorage, [project.id!]));

  const importFile = async (file: File) => {
    try {
      const { imported, skipped } = importDiscoveries(window.localStorage, await file.text());
      setMessage(`${imported} projeto(s) importado(s)${skipped ? `, ${skipped} ignorado(s) porque a versão daqui é mais recente` : ""}.`);
      setData(load());
    } catch (problem) {
      setMessage(problem instanceof Error ? problem.message : "Não foi possível importar o arquivo.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Memória do workspace"
        title="Projetos salvos"
        description="Os projetos ficam só neste navegador. Para passar um projeto a um colega ou fazer backup, exporte o arquivo e peça para a outra pessoa importar."
        actions={
          <>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importFile(file);
                event.target.value = "";
              }}
            />
            <Button variant="outline" size="sm" className="border-line-strong text-action" onClick={() => fileInput.current?.click()}>
              <Upload /> Importar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-line-strong text-action"
              disabled={!projects.length}
              onClick={() => downloadText(`discovery-backup-${fileDate()}.json`, exportDiscoveries(window.localStorage))}
            >
              <Download /> Exportar todos
            </Button>
            <Button size="sm" onClick={onNew} className="bg-action hover:bg-action-hover">
              <Plus /> Novo discovery
            </Button>
          </>
        }
      />
      <div className="flex-1 p-5 md:p-8">
        {message && <p className="mb-5 rounded-xl border border-brand-line bg-brand-soft p-3 text-sm text-brand-strong">{message}</p>}
        {error ? (
          <div className="rounded-2xl border border-danger-line bg-danger-soft p-5 text-sm text-danger">{error}</div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong bg-white p-10 text-center">
            <FolderOpen className="mx-auto size-8 text-ink-faint" />
            <h2 className="mt-4 font-semibold text-ink">Nenhum discovery salvo ainda</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Crie um discovery e dê um nome: ele é salvo automaticamente. Ou importe um arquivo recebido de um colega.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="gap-4 border-line py-5 shadow-none">
                <CardHeader className="px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-lg text-ink">{project.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">{project.outcome || "Resultado ainda não informado"}</CardDescription>
                    </div>
                    {project.insights && (
                      <Badge variant="outline" className="shrink-0 border-ai-line bg-ai-soft text-ai">
                        <Sparkles /> IA
                      </Badge>
                    )}
                  </div>
                  {project.updated_at && (
                    <p className="text-[11px] text-ink-faint">Atualizado em {new Date(project.updated_at).toLocaleString("pt-BR")}</p>
                  )}
                </CardHeader>
                <CardContent className="px-5">
                  <div className="flex flex-wrap gap-2">
                    {project.tracks.map((id) => (
                      <Badge key={id} variant="secondary" className="bg-surface-2 text-ink-muted">
                        {tracks.find((track) => track.id === id)?.name ?? id}
                      </Badge>
                    ))}
                  </div>
                  <Button onClick={() => onOpen(project)} variant="outline" className="mt-5 w-full border-line-strong text-brand-strong">
                    Abrir e continuar <ArrowRight />
                  </Button>
                  <div className="mt-2 flex gap-2">
                    <Button onClick={() => exportOne(project)} variant="ghost" size="sm" className="flex-1 text-ink-soft">
                      <Download /> Exportar
                    </Button>
                    <Button onClick={() => remove(project)} variant="ghost" size="sm" className="flex-1 text-danger hover:text-danger">
                      <Trash2 /> Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
