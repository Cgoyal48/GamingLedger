import { ErrorNote } from "@app/shared/components/ErrorNote";
import { GameCover } from "@app/shared/components/GameCover";
import { Button } from "@/components/ui/button";
import { useIgdbSearch } from "@/api/igdb/hooks";
import type { IgdbMatch } from "@/api/igdb/types";

const MIN_QUERY = 2;

/** IGDB matches for `query`, or the match already picked. Picking only links it; saving happens on submit. */
export function IgdbPicker({
  query,
  linked,
  onPick,
  onUnlink,
}: {
  query: string;
  linked: IgdbMatch | null;
  onPick: (match: IgdbMatch) => void;
  onUnlink: () => void;
}) {
  const search = useIgdbSearch(linked ? "" : query);

  if (linked) {
    return (
      <div className="-mt-1 flex items-center gap-3 border-y border-border px-1 py-1.5">
        <GameCover url={linked.cover_url} title={linked.name} className="w-7" />
        <div className="min-w-0 flex-1">
          <p className="truncate">{linked.name}</p>
          <p className="hud-label text-primary">Linked to IGDB · {linked.year ?? "—"}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onUnlink}>
          Change
        </Button>
      </div>
    );
  }

  if (query.length < MIN_QUERY) {
    return null;
  }

  return (
    <div className="-mt-1 max-h-56 overflow-y-auto border-y border-border">
      {search.isPending ? (
        <p className="hud-label px-1 py-3">Searching IGDB…</p>
      ) : search.isError ? (
        <ErrorNote className="px-1 py-3">Could not search IGDB. Saving keeps it as a custom title.</ErrorNote>
      ) : search.data.length === 0 ? (
        <p className="px-1 py-3 text-sm text-muted-foreground">No IGDB match. Saving keeps it as a custom title.</p>
      ) : (
        <ul aria-label="IGDB matches">
          {search.data.map((match) => (
            <li key={match.igdb_id}>
              <button
                type="button"
                onClick={() => onPick(match)}
                className="flex w-full items-center gap-3 px-1 py-1.5 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
              >
                <GameCover url={match.cover_url} title={match.name} className="w-7" />
                <span className="min-w-0 flex-1 truncate">{match.name}</span>
                <span className="numeric text-xs text-muted-foreground">{match.year ?? "—"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
