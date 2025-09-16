(() => {
  // src/code.ts
  console.log("Plugin starting...");
  var html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Promptifier UI</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .container {
      max-width: 600px;
      width: 100%;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
    }
    h2 {
      color: #4f46e5;
      text-align: center;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .generate-btn {
      width: 100%;
      padding: 18px 30px;
      font-size: 18px;
      font-weight: 600;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      border: none;
      border-radius: 12px;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
      position: relative;
      overflow: hidden;
    }
    .generate-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    .generate-btn:hover::before {
      left: 100%;
    }
    .generate-btn:hover {
      background: linear-gradient(135deg, #4f46e5, #3730a3);
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.6);
    }
    .textareas {
      display: flex;
      gap: 20px;
    }
    .textarea-container {
      position: relative;
      flex: 1;
    }
    .copy-btn {
      position: absolute;
      top: 16px;
      right: 2px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.9);
      color: #666;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .copy-btn:hover {
      background: rgba(99, 102, 241, 0.1);
      color: #4f46e5;
      border-color: #4f46e5;
      transform: scale(1.05);
    }
    textarea {
      width: 100%;
      height: 150px;
      margin-top: 15px;
      padding: 15px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      resize: vertical;
      background: rgba(255, 255, 255, 0.9);
      transition: border-color 0.3s ease;
    }
    textarea:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Promptifier \u{1F525} Export Prompt Design-to-Code</h2>
    <p id="selectedFrame" style="color: #666; font-size: 14px; margin: 10px 0;">Aucune frame s\xE9lectionn\xE9e</p>
    <button id="generate" class="generate-btn">\u26A1 G\xE9n\xE9rer</button>
    <div class="textareas">
      <div class="textarea-container">
        <textarea id="promptArea" readonly placeholder="Prompt g\xE9n\xE9r\xE9..."></textarea>
        <button class="copy-btn" data-target="promptArea">
          <svg width="16" height="16" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M565.632 471.936C565.632 523.683 523.683 565.632 471.936 565.632H237.696C185.949 565.632 144 523.683 144 471.936V237.696C144 185.949 185.949 144 237.696 144H471.936C523.683 144 565.632 185.949 565.632 237.696V471.936Z" stroke="currentColor" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M328.064 656H562.304C614.051 656 656 614.048 656 562.304V328.062" stroke="currentColor" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="textarea-container">
        <textarea id="jsonArea" readonly placeholder="JSON hi\xE9rarchique..."></textarea>
        <button class="copy-btn" data-target="jsonArea">
          <svg width="16" height="16" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M565.632 471.936C565.632 523.683 523.683 565.632 471.936 565.632H237.696C185.949 565.632 144 523.683 144 471.936V237.696C144 185.949 185.949 144 237.696 144H471.936C523.683 144 565.632 185.949 565.632 237.696V471.936Z" stroke="currentColor" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M328.064 656H562.304C614.051 656 656 614.048 656 562.304V328.062" stroke="currentColor" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <script>
    window.onmessage = (event) => {
      if (event.data.pluginMessage) {
        const msg = event.data.pluginMessage;
        if (msg.type === 'result') {
          document.getElementById('promptArea').value = msg.prompt;
          document.getElementById('jsonArea').value = msg.json;
        } else if (msg.type === 'selection') {
          if (msg.frameName) {
            document.getElementById('selectedFrame').textContent = 'Frame s\xE9lectionn\xE9e: ' + msg.frameName;
          } else {
            document.getElementById('selectedFrame').textContent = 'Aucune frame s\xE9lectionn\xE9e';
          }
        } else if (msg.type === 'error') {
          alert(msg.message);
        }
      }
    };

    document.getElementById('generate').onclick = () => {
      parent.postMessage({ pluginMessage: { type: 'generate' } }, '*');
    };

    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.onclick = () => {
        const target = btn.getAttribute('data-target');
        const text = document.getElementById(target).value;
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Copi\xE9!');
      };
    });
  <\/script>
</body>
</html>`;
  figma.showUI(html, { width: 800, height: 450 });
  console.log("UI shown");
  var updateSelection = () => {
    const selection = figma.currentPage.selection;
    if (selection.length > 0) {
      const node = selection[0];
      if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE") {
        figma.ui.postMessage({ type: "selection", frameName: node.name });
      } else {
        figma.ui.postMessage({ type: "selection", frameName: null });
      }
    } else {
      figma.ui.postMessage({ type: "selection", frameName: null });
    }
  };
  figma.on("selectionchange", updateSelection);
  updateSelection();
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "generate") {
      await generatePrompt();
    }
  };
  async function generatePrompt() {
    try {
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.ui.postMessage({ type: "error", message: "No selection. Please select a frame, component, or instance." });
        return;
      }
      const node = selection[0];
      if (!(node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE")) {
        figma.ui.postMessage({ type: "error", message: "Please select a frame, component, or instance." });
        return;
      }
      await loadFonts(node);
      const json = await serializeNode(node);
      const prompt = `Generate pixel-perfect code for this Figma design. The design is described in the following JSON hierarchy:

${JSON.stringify(json, null, 2)}

Please output the code in HTML/CSS/JS or your preferred framework, ensuring exact dimensions, colors, fonts, and layout.`;
      figma.ui.postMessage({ type: "result", prompt, json: JSON.stringify(json, null, 2), frameName: node.name });
    } catch (error) {
      console.error("Error in generatePrompt:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      figma.ui.postMessage({ type: "error", message: "An error occurred while generating the prompt: " + errorMessage });
    }
  }
  async function loadFonts(node) {
    if (node.type === "TEXT") {
      await figma.loadFontAsync(node.fontName);
    } else if ("children" in node) {
      for (const child of node.children) {
        await loadFonts(child);
      }
    }
  }
  async function serializeNode(node) {
    const base = {
      id: node.id,
      name: node.name,
      type: node.type,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      visible: node.visible
    };
    if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE") {
      return {
        id: base.id,
        name: base.name,
        type: base.type,
        x: base.x,
        y: base.y,
        width: base.width,
        height: base.height,
        visible: base.visible,
        layoutMode: node.layoutMode,
        primaryAxisSizingMode: node.primaryAxisSizingMode,
        counterAxisSizingMode: node.counterAxisSizingMode,
        primaryAxisAlignItems: node.primaryAxisAlignItems,
        counterAxisAlignItems: node.counterAxisAlignItems,
        paddingLeft: node.paddingLeft,
        paddingRight: node.paddingRight,
        paddingTop: node.paddingTop,
        paddingBottom: node.paddingBottom,
        itemSpacing: node.itemSpacing,
        fills: node.fills,
        strokes: node.strokes,
        strokeWeight: node.strokeWeight,
        cornerRadius: node.cornerRadius,
        constraints: node.constraints,
        children: await Promise.all(node.children.map(serializeNode))
      };
    } else if (node.type === "TEXT") {
      return {
        id: base.id,
        name: base.name,
        type: base.type,
        x: base.x,
        y: base.y,
        width: base.width,
        height: base.height,
        visible: base.visible,
        characters: node.characters,
        fontSize: node.fontSize,
        fontName: node.fontName,
        fills: node.fills,
        textAlignHorizontal: node.textAlignHorizontal,
        textAlignVertical: node.textAlignVertical,
        lineHeight: node.lineHeight,
        textCase: node.textCase,
        textDecoration: node.textDecoration,
        letterSpacing: node.letterSpacing,
        paragraphSpacing: node.paragraphSpacing,
        paragraphIndent: node.paragraphIndent
      };
    } else if (node.type === "VECTOR") {
      return {
        id: base.id,
        name: base.name,
        type: base.type,
        x: base.x,
        y: base.y,
        width: base.width,
        height: base.height,
        visible: base.visible,
        fills: node.fills,
        strokes: node.strokes,
        strokeWeight: node.strokeWeight,
        vectorPaths: node.vectorPaths,
        rotation: node.rotation
      };
    } else if (node.type === "GROUP") {
      return {
        id: base.id,
        name: base.name,
        type: base.type,
        x: base.x,
        y: base.y,
        width: base.width,
        height: base.height,
        visible: base.visible,
        children: await Promise.all(node.children.map(serializeNode))
      };
    } else if (node.type === "RECTANGLE" || node.type === "ELLIPSE" || node.type === "POLYGON" || node.type === "STAR") {
      return {
        id: base.id,
        name: base.name,
        type: base.type,
        x: base.x,
        y: base.y,
        width: base.width,
        height: base.height,
        visible: base.visible,
        fills: node.fills,
        strokes: node.strokes,
        strokeWeight: node.strokeWeight,
        cornerRadius: node.cornerRadius
      };
    } else {
      return base;
    }
  }
})();
