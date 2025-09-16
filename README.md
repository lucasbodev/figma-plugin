# Figma Plugin: Promptifier — Export Prompt Design-to-Code

This Figma plugin analyzes the selected frame, component, or instance and generates a hierarchical JSON representation along with a textual prompt for pixel-perfect design-to-code conversion using an LLM.

## Features

- Extracts dimensions, fills, strokes, text properties (characters, font, size, color), layout mode, and constraints.
- Serializes the design hierarchy into JSON.
- Generates a prompt text including the JSON for LLM-based code generation.
- Simple UI to view and copy the generated prompt and JSON.

## Installation

1. Clone or download this repository.
2. Navigate to the project directory.
3. Run `npm install` to install dependencies.

## Build

- Run `npm run build` to compile the TypeScript code using esbuild. The output will be in the `dist/` directory.
- For development, use `npm run watch` to watch for changes and rebuild automatically.

## Usage

1. After building, load the plugin in Figma:
   - In Figma, go to Plugins > Development > Import plugin from manifest...
   - Select the `manifest.json` file from this project.
2. Select a frame, component, or instance in your Figma design.
3. Run the plugin from the Plugins menu.
4. In the plugin UI, click "Générer" to analyze the selection and generate the prompt and JSON.
5. Use "Copier le prompt" or "Copier le JSON" to copy the content to the clipboard.
6. Click "Fermer" to close the plugin.

## Project Structure

- `manifest.json`: Plugin manifest for Figma.
- `package.json`: NPM package configuration with build scripts.
- `src/code.ts`: Main plugin logic in TypeScript.
- `src/ui.html`: HTML UI for the plugin.
- `README.md`: This file.

## Extensions

Potential future enhancements:
- Export to Tailwind CSS classes.
- Support for CSS-in-JS frameworks (e.g., styled-components).
- Export images and assets.
- Handle more component types and advanced layouts.

## Requirements

- Figma Desktop App
- Node.js and npm for building

## License

This project is open-source. Feel free to modify and distribute.