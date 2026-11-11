import { Checkbox } from "@/components/ui/checkbox";
import { tracks } from "@/config/tracks";

export function TrackPicker({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {tracks.map((track) => {
        const Icon = track.icon;
        const checked = selected.includes(track.id);
        return (
          <label
            key={track.id}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${checked ? "border-brand-line bg-brand-soft shadow-[0_0_0_1px_rgba(73,140,205,.08)]" : "border-line bg-white hover:border-line-strong"}`}
          >
            <Checkbox checked={checked} onCheckedChange={() => onToggle(track.id)} className="mt-0.5" />
            <span
              className="grid size-8 shrink-0 place-items-center rounded-lg"
              style={{ backgroundColor: `${track.color}20`, color: track.color }}
            >
              <Icon className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">{track.name}</span>
              <span className="mt-1 block text-xs leading-5 text-ink-muted">{track.short}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

export const toggleId = (list: string[], id: string) =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
