import { CoinsIcon, PlusIcon } from "lucide-react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useSession } from "@/providers/useSession";
import { GameDialog } from "@app/inventory/components/GameDialog";
import { LogPurchaseDialog } from "@app/loot/components/LogPurchaseDialog";
import { FullScreenLoader } from "@app/shared/components/FullScreenLoader";
import { KeyHint } from "@app/shared/components/KeyHint";
import { useKeyboardShortcuts } from "@app/shared/hooks/useKeyboardShortcuts";
import { ShellActionsContext } from "@app/shared/hooks/useShellActions";
import { LibraryTotals } from "@app/shell/components/LibraryTotals";
import { PageTabs } from "@app/shell/components/PageTabs";
import { pages } from "@app/shell/constants/pages";
import { useShellDialogs } from "@app/shell/hooks/useShellDialogs";

/** Layout for every signed-in page. Signed-out visitors go to the sign-in page. */
export function LoggedInAppShell() {
  const { ready, session } = useSession();
  if (!ready) {
    return <FullScreenLoader />;
  }
  return session ? <Shell /> : <Navigate to="/start" replace />;
}

function Shell() {
  const navigate = useNavigate();
  const { game, purchase, actions, setGameOpen, setPurchaseOpen, anyOpen } = useShellDialogs();

  useKeyboardShortcuts(
    {
      n: actions.addGame,
      l: () => actions.logPurchase(),
      ...Object.fromEntries(pages.map((page) => [page.key, () => navigate(page.to)])),
    },
    !anyOpen,
  );

  return (
    <ShellActionsContext value={actions}>
      <div className="mx-auto flex min-h-svh max-w-6xl flex-col px-4 pb-16 sm:px-6">
        <header className="sticky top-0 z-30 -mx-4 bg-background/80 px-4 pt-4 backdrop-blur-md sm:-mx-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <NavLink to="/inventory" className="text-xl font-bold tracking-tight">
              GAMING<span className="text-primary">/</span>LEDGER
            </NavLink>
            <LibraryTotals />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-border">
            <PageTabs />
            <div className="flex gap-2 pb-2">
              <Button variant="outline" size="sm" onClick={() => actions.logPurchase()}>
                <CoinsIcon /> Log purchase <KeyHint className="ml-1">L</KeyHint>
              </Button>
              <Button size="sm" onClick={actions.addGame}>
                <PlusIcon /> New game{" "}
                <KeyHint onPrimary className="ml-1">
                  N
                </KeyHint>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 pt-8">
          <Outlet />
        </main>
      </div>

      <GameDialog open={game.open} copy={game.copy} onOpenChange={setGameOpen} />
      <LogPurchaseDialog
        open={purchase.open}
        copyId={purchase.copyId}
        editing={purchase.editing}
        onOpenChange={setPurchaseOpen}
      />
    </ShellActionsContext>
  );
}
