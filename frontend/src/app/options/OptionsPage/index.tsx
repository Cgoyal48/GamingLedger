import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/providers/useSession";
import { ErrorNote } from "@app/shared/components/ErrorNote";
import { KeyHint } from "@app/shared/components/KeyHint";
import { LoadState } from "@app/shared/components/LoadState";
import { pages } from "@app/shell/constants/pages";
import { PageHeader } from "@app/shared/components/PageHeader";
import { Segmented } from "@app/shared/components/Segmented";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/api/settings/hooks";
import { currencies } from "@/api/settings/types";
import { supabase } from "@/api/supabase";

const shortcuts = [
  ["N", "Add a game"],
  ["L", "Log a purchase"],
  [`1 – ${pages.length}`, "Switch page"],
  ["Esc", "Close a dialog"],
] as const;

export function OptionsPage() {
  const { session } = useSession();
  const settings = useSettings();
  const update = useUpdateSettings();

  return (
    <section className="max-w-2xl">
      <PageHeader eyebrow="Options" title="Settings" />

      <div className="flex flex-col gap-4">
        <div className="panel p-5">
          <h2 className="font-semibold">Display currency</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Totals and cost per hour are shown in this currency. Purchases in other currencies are converted at the
            European Central Bank rate on the day you bought them, and marked with ≈.
          </p>
          {settings.isPending ? (
            <LoadState />
          ) : settings.isError ? (
            <LoadState error retry={() => void settings.refetch()} />
          ) : (
            <Segmented
              label="Display currency"
              value={update.isPending ? update.variables.display_currency : settings.data.display_currency}
              options={currencies.map((code) => ({ value: code, label: code }))}
              onChange={(display_currency) =>
                update.mutate(
                  { display_currency },
                  { onSuccess: () => toast.success(`Showing values in ${display_currency}`) },
                )
              }
            />
          )}
          {update.isError ? <ErrorNote className="mt-3">Could not save the currency.</ErrorNote> : null}
        </div>

        <div className="panel p-5">
          <h2 className="font-semibold">Controls</h2>
          <dl className="mt-3 grid grid-cols-[5rem_1fr] gap-x-4 gap-y-2 text-sm">
            {shortcuts.map(([keys, action]) => (
              <div key={keys} className="contents">
                <dt>
                  <KeyHint>{keys}</KeyHint>
                </dt>
                <dd className="text-muted-foreground">{action}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="panel flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h2 className="font-semibold">Account</h2>
            <p className="text-sm text-muted-foreground">{session?.user.email}</p>
          </div>
          <Button variant="outline" onClick={() => void supabase.auth.signOut()}>
            <LogOutIcon /> Sign out
          </Button>
        </div>
      </div>
    </section>
  );
}
