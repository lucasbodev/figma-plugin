// Shared types for the Figma plugin

export interface SelectionMessage {
  type: 'selection';
  frameName: string | null;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export interface ResultMessage {
  type: 'result';
  prompt: string;
  json: string;
  frameName: string;
  images: Array<{ path: string; data: string }>;
}

export type UIMessage = SelectionMessage | ErrorMessage | ResultMessage;

export interface GenerateMessage {
  type: 'generate';
}

export type PluginMessage = GenerateMessage;

export interface ImageData {
  path: string;
  data: string;
}