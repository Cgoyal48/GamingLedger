import { Navigate, Outlet } from "react-router";
import { useSession } from "@/providers/useSession";
import { FullScreenLoader } from "@app/shared/components/FullScreenLoader";

/** Layout for pages only signed-out visitors see. Signed-in users go straight to their inventory. */
export function LoggedOutAppShell() {
  const { ready, session } = useSession();
  if (!ready) {
    return <FullScreenLoader />;
  }
  return session ? <Navigate to="/inventory" replace /> : <Outlet />;
}
