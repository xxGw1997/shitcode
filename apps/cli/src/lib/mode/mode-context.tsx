import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getModeIndex, modes, type Mode } from "@shitcode/tools/runtime";

type ModeController = {
  mode: Mode;
  index: number;
  next: () => void;
  previous: () => void;
  setMode: (id: string) => void;
};

const ModeContext = createContext<ModeController | null>(null);

type ModeProviderProps = {
  children: ReactNode;
};

export function ModeProvider({ children }: ModeProviderProps) {
  const [index, setIndex] = useState(0);
  const mode = modes[index];

  const controller = useMemo<ModeController>(
    () => ({
      mode,
      index,
      next: () =>
        setIndex((current) => (current + 1) % modes.length),
      previous: () =>
        setIndex((current) => (current - 1 + modes.length) % modes.length),
      setMode: (id) => {
        const next = getModeIndex(id);
        if (next >= 0) {
          setIndex(next);
        }
      },
    }),
    [mode, index],
  );

  return <ModeContext.Provider value={controller}>{children}</ModeContext.Provider>;
}

export function useModeController(): ModeController {
  const context = useContext(ModeContext);

  if (!context) {
    throw new Error("useModeController must be used inside <ModeProvider>");
  }

  return context;
}
