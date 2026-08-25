import { createContext, useContext } from 'solid-js';

export type SolidNodeViewContextValue = {
  onDragStart?: (event: DragEvent) => void;
  nodeViewContentRef?: (element: HTMLElement | null) => void;
};

export const SolidNodeViewContext = createContext<SolidNodeViewContextValue>({});

export function useSolidNodeView(): SolidNodeViewContextValue {
  return useContext(SolidNodeViewContext);
}
