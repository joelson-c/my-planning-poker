import type { ReactNode } from "react";
import { createStore, Provider } from "jotai";

export const store = createStore();

export function AtomProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
