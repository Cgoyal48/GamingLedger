import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { router } from "@app/routes";
import { SessionProvider } from "@/providers/SessionProvider";
import "@/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <MotionConfig reducedMotion="user">
          <TooltipProvider delay={300}>
            <RouterProvider router={router} />
            <Toaster position="bottom-center" />
          </TooltipProvider>
        </MotionConfig>
      </SessionProvider>
    </QueryClientProvider>
  </StrictMode>,
);
