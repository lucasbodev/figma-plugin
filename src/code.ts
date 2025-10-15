// Figma Plugin: Promptifier - Export Design-to-Code Prompt
/// <reference path="../node_modules/@figma/plugin-typings/index.d.ts" />

import { updateSelection } from './selection.js';
import { loadFonts } from './fontLoader.js';
import { serializeNode } from './serializer.js';
import { cleanObject, collectImageData, removeImageDataFromJson } from './dataProcessor.js';
import { generatePrompt } from './promptGenerator.js';
import type { ErrorMessage, ResultMessage } from './types.js';

console.log('Plugin starting...');
figma.showUI(__html__, { width: 800, height: 450 });
console.log('UI shown');

figma.on('selectionchange', updateSelection);

// Initial update
updateSelection();

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate') {
    await handleGenerate();
  }
};

async function handleGenerate() {
  try {
    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      figma.ui.postMessage({ type: 'error', message: 'No selection. Please select a frame, component, or instance.' } as ErrorMessage);
      return;
    }

    const node = selection[0];
    if (!(node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE' || node.type === 'VECTOR')) {
      figma.ui.postMessage({ type: 'error', message: 'Please select a frame, component, instance, or vector.' } as ErrorMessage);
      return;
    }

    // Load fonts
    await loadFonts(node);

    // Serialize to JSON
    const json = cleanObject(await serializeNode(node, { svg: 0, svgCache: new Map() }));

    // Collect image data for UI and ZIP creation
    const imageData = collectImageData(json);

    // Create clean JSON without base64 data
    const cleanJson = removeImageDataFromJson(json);

    // Generate prompt
    const prompt = generatePrompt(node.name, cleanJson);

    figma.ui.postMessage({
      type: 'result',
      prompt,
      json: JSON.stringify(cleanJson),
      frameName: node.name,
      images: imageData
    } as ResultMessage);
  } catch (error) {
    console.error('Error in handleGenerate:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    figma.ui.postMessage({ type: 'error', message: 'An error occurred while generating the prompt: ' + errorMessage } as ErrorMessage);
  }
}
