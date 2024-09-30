import { useAtomsDevtools } from "jotai-devtools";

export function AtomDevTools() {
  if (typeof window === "undefined") {
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useAtomsDevtools("atoms");

  return null;
}
