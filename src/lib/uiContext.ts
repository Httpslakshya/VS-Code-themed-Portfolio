import { createContext, useContext } from 'react';
import type { Project } from '../data/portfolio';

/** Shared UI actions so any section can open the terminal or a case study. */
export interface UIActions {
  openTerminal: (command?: string) => void;
  openCase: (project: Project) => void;
  closeCase: () => void;
  caseProject: Project | null;
}

export const UIContext = createContext<UIActions>({
  openTerminal: () => {},
  openCase: () => {},
  closeCase: () => {},
  caseProject: null,
});

export const useUI = () => useContext(UIContext);
