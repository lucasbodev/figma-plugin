import type { SelectionMessage } from './types.js';

export const updateSelection = (): void => {
  const selection = figma.currentPage.selection;
  if (selection.length > 0) {
    const node = selection[0];
    if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE' || node.type === 'VECTOR') {
      figma.ui.postMessage({ type: 'selection', frameName: node.name } as SelectionMessage);
    } else {
      figma.ui.postMessage({ type: 'selection', frameName: null } as SelectionMessage);
    }
  } else {
    figma.ui.postMessage({ type: 'selection', frameName: null } as SelectionMessage);
  }
};