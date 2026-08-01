import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { AnimatePresence } from "framer-motion";
import { IntroAnimation } from "@/components/IntroAnimation";
import { useIntroAnimation } from "@/hooks/use-intro-animation";


export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
