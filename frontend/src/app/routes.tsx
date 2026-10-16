import { createBrowserRouter, Navigate } from "react-router";
import { SignInPage } from "@app/auth/SignInPage";
import { InventoryPage } from "@app/inventory/InventoryPage";
import { LoggedInAppShell } from "@app/shell/LoggedInAppShell";
import { LoggedOutAppShell } from "@app/shell/LoggedOutAppShell";
import { LootPage } from "@app/loot/LootPage";
import { OptionsPage } from "@app/options/OptionsPage";
import { QuestsPage } from "@app/quests/QuestsPage";
import { StatsPage } from "@app/stats/StatsPage";
import { TimelinePage } from "@app/timeline/TimelinePage";

export const router = createBrowserRouter([
  {
    element: <LoggedOutAppShell />,
    children: [{ path: "/start", element: <SignInPage /> }],
  },
  {
    path: "/",
    element: <LoggedInAppShell />,
    children: [
      { index: true, element: <Navigate to="/inventory" replace /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "quests", element: <QuestsPage /> },
      { path: "loot", element: <LootPage /> },
      { path: "timeline", element: <TimelinePage /> },
      { path: "stats", element: <StatsPage /> },
      { path: "options", element: <OptionsPage /> },
      { path: "*", element: <Navigate to="/inventory" replace /> },
    ],
  },
]);
