"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const AppWrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();

  const [render, setRender] = useState(false);
  useEffect(() => {
    setRender(true);
  }, []);
  return render ? (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Provider store={store}>{children}</Provider>
    </QueryClientProvider>
  ) : null;
};
