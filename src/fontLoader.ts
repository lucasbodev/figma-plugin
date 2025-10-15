export async function loadFonts(node: SceneNode): Promise<void> {
  if (node.type === 'TEXT') {
    console.log('loadFonts: node.fontName =', node.fontName, 'type:', typeof node.fontName);
    if (node.fontName && typeof node.fontName === 'object' && 'family' in node.fontName && 'style' in node.fontName) {
      await figma.loadFontAsync(node.fontName);
    } else {
      console.warn('Invalid fontName for node:', node.name, node.fontName);
    }
  } else if ('children' in node) {
    for (const child of node.children) {
      await loadFonts(child);
    }
  }
}