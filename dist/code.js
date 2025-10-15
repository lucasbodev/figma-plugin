// src/selection.ts
var updateSelection = () => {
  const selection = figma.currentPage.selection;
  if (selection.length > 0) {
    const node = selection[0];
    if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE" || node.type === "VECTOR") {
      figma.ui.postMessage({ type: "selection", frameName: node.name });
    } else {
      figma.ui.postMessage({ type: "selection", frameName: null });
    }
  } else {
    figma.ui.postMessage({ type: "selection", frameName: null });
  }
};

// src/fontLoader.ts
async function loadFonts(node) {
  if (node.type === "TEXT") {
    console.log("loadFonts: node.fontName =", node.fontName, "type:", typeof node.fontName);
    if (node.fontName && typeof node.fontName === "object" && "family" in node.fontName && "style" in node.fontName) {
      await figma.loadFontAsync(node.fontName);
    } else {
      console.warn("Invalid fontName for node:", node.name, node.fontName);
    }
  } else if ("children" in node) {
    for (const child of node.children) {
      await loadFonts(child);
    }
  }
}

// src/serializer.ts
async function processPaint(paint) {
  if (paint.type === "SOLID") {
    const { r, g, b } = paint.color;
    const hex = "#" + [r, g, b].map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
    return Object.assign({}, paint, { hex });
  } else if (paint.type === "IMAGE" && paint.imageHash) {
    const image = figma.getImageByHash(paint.imageHash);
    if (image) {
      const bytes = await image.getBytesAsync();
      const base64 = figma.base64Encode(bytes);
      return Object.assign({}, paint, {
        imagePath: `assets/images/${paint.imageHash}.png`,
        imageData: base64
        // Keep for UI display and ZIP creation
      });
    }
  }
  return paint;
}
async function serializeNode(node, counters = { svg: 0, svgCache: /* @__PURE__ */ new Map() }) {
  const base = {
    id: node.id,
    name: node.name,
    type: node.type,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    visible: node.visible,
    opacity: node.opacity,
    blendMode: node.blendMode,
    effects: node.effects,
    rotation: node.rotation
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
      opacity: base.opacity,
      blendMode: base.blendMode,
      effects: base.effects,
      rotation: base.rotation,
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
      fills: Array.isArray(node.fills) ? await Promise.all(node.fills.map(processPaint)) : node.fills,
      backgrounds: Array.isArray(node.backgrounds) ? await Promise.all(node.backgrounds.map(processPaint)) : node.backgrounds,
      strokes: Array.isArray(node.strokes) ? await Promise.all(node.strokes.map(processPaint)) : node.strokes,
      strokeWeight: node.strokeWeight,
      individualStrokeWeights: node.individualStrokeWeights,
      strokeAlign: node.strokeAlign,
      strokeDashes: node.strokeDashes,
      strokesIncludedInLayout: node.strokesIncludedInLayout,
      cornerRadius: node.cornerRadius,
      clipsContent: node.clipsContent,
      layoutGrids: node.layoutGrids,
      constraints: node.constraints,
      boundVariables: node.boundVariables,
      componentProperties: node.componentProperties,
      mainComponent: node.mainComponent,
      scaleFactor: node.scaleFactor,
      variantProperties: node.variantProperties,
      overriddenSymbolID: node.overriddenSymbolID,
      children: await Promise.all(node.children.map((child) => serializeNode(child, counters)))
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
      opacity: base.opacity,
      blendMode: base.blendMode,
      effects: base.effects,
      rotation: base.rotation,
      characters: node.characters,
      fontSize: node.fontSize,
      fontName: node.fontName,
      fills: Array.isArray(node.fills) ? await Promise.all(node.fills.map(processPaint)) : node.fills,
      textAlignHorizontal: node.textAlignHorizontal,
      textAlignVertical: node.textAlignVertical,
      lineHeight: node.lineHeight,
      textCase: node.textCase,
      textDecoration: node.textDecoration,
      letterSpacing: node.letterSpacing,
      paragraphSpacing: node.paragraphSpacing,
      paragraphIndent: node.paragraphIndent,
      boundVariables: node.boundVariables
    };
  } else if (node.type === "VECTOR") {
    const svgString = await node.exportAsync({ format: "SVG" });
    const svgData = figma.base64Encode(svgString);
    let svgPath;
    if (counters.svgCache.has(svgData)) {
      svgPath = counters.svgCache.get(svgData);
    } else {
      svgPath = `assets/icons/icon-${++counters.svg}.svg`;
      counters.svgCache.set(svgData, svgPath);
    }
    return {
      id: base.id,
      name: base.name,
      type: base.type,
      x: base.x,
      y: base.y,
      width: base.width,
      height: base.height,
      visible: base.visible,
      opacity: base.opacity,
      blendMode: base.blendMode,
      effects: base.effects,
      rotation: base.rotation,
      fills: Array.isArray(node.fills) ? await Promise.all(node.fills.map(processPaint)) : node.fills,
      strokes: Array.isArray(node.strokes) ? await Promise.all(node.strokes.map(processPaint)) : node.strokes,
      strokeWeight: node.strokeWeight,
      individualStrokeWeights: node.individualStrokeWeights,
      strokeAlign: node.strokeAlign,
      strokeDashes: node.strokeDashes,
      strokesIncludedInLayout: node.strokesIncludedInLayout,
      vectorPaths: node.vectorPaths,
      svgPath,
      svgData,
      // Keep for UI display and ZIP creation
      boundVariables: node.boundVariables
    };
  } else if (node.type === "GROUP") {
    const allVectors = node.children.every((child) => child.type === "VECTOR");
    if (allVectors && node.children.length > 1) {
      const svgString = await node.exportAsync({ format: "SVG" });
      const svgData = figma.base64Encode(svgString);
      let svgPath;
      if (counters.svgCache.has(svgData)) {
        svgPath = counters.svgCache.get(svgData);
      } else {
        svgPath = `assets/icons/icon-${++counters.svg}.svg`;
        counters.svgCache.set(svgData, svgPath);
      }
      const children = await Promise.all(node.children.map(async (child) => {
        const childBase = {
          id: child.id,
          name: child.name,
          type: child.type,
          x: child.x,
          y: child.y,
          width: child.width,
          height: child.height,
          visible: child.visible,
          opacity: child.opacity,
          blendMode: child.blendMode,
          effects: child.effects,
          rotation: child.rotation
        };
        return Object.assign({}, childBase, {
          fills: Array.isArray(child.fills) ? await Promise.all(child.fills.map(processPaint)) : child.fills,
          strokes: Array.isArray(child.strokes) ? await Promise.all(child.strokes.map(processPaint)) : child.strokes,
          strokeWeight: child.strokeWeight,
          individualStrokeWeights: child.individualStrokeWeights,
          strokeAlign: child.strokeAlign,
          strokeDashes: child.strokeDashes,
          strokesIncludedInLayout: child.strokesIncludedInLayout,
          vectorPaths: child.vectorPaths,
          boundVariables: child.boundVariables
        });
      }));
      return Object.assign({}, base, {
        type: "VECTOR_GROUP",
        // New type to indicate grouped vectors
        svgPath,
        svgData,
        children
        // Keep children for reference but without individual SVG data
      });
    } else {
      const children = await Promise.all(node.children.map((child) => serializeNode(child, counters)));
      return Object.assign({}, base, {
        children
      });
    }
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
      fills: Array.isArray(node.fills) ? await Promise.all(node.fills.map(processPaint)) : node.fills,
      strokes: Array.isArray(node.strokes) ? await Promise.all(node.strokes.map(processPaint)) : node.strokes,
      strokeWeight: node.strokeWeight,
      cornerRadius: node.cornerRadius
    };
  } else {
    return base;
  }
}

// src/dataProcessor.ts
function cleanObject(obj) {
  if (Array.isArray(obj)) return obj.map(cleanObject);
  if (obj && typeof obj === "object") {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value != null && value !== "" && !(Array.isArray(value) && value.length === 0)) {
        cleaned[key] = cleanObject(value);
      }
    }
    return cleaned;
  }
  return obj;
}
function collectImageData(obj) {
  const images = [];
  const seenPaths = /* @__PURE__ */ new Set();
  function collect(obj2) {
    if (Array.isArray(obj2)) {
      obj2.forEach((item) => collect(item));
    } else if (obj2 && typeof obj2 === "object") {
      for (const [key, value] of Object.entries(obj2)) {
        if (key === "imageData" && typeof value === "string" && obj2.imagePath) {
          if (!seenPaths.has(obj2.imagePath)) {
            images.push({ path: obj2.imagePath, data: value });
            seenPaths.add(obj2.imagePath);
          }
        } else if (key === "svgData" && obj2.svgPath) {
          if (typeof value === "string" && !seenPaths.has(obj2.svgPath)) {
            images.push({ path: obj2.svgPath, data: value });
            seenPaths.add(obj2.svgPath);
          }
        } else {
          collect(value);
        }
      }
    }
  }
  collect(obj);
  return images;
}
function removeImageDataFromJson(obj) {
  if (Array.isArray(obj)) return obj.map(removeImageDataFromJson);
  if (obj && typeof obj === "object") {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "imageData" || key === "svgData") {
        continue;
      } else {
        cleaned[key] = removeImageDataFromJson(value);
      }
    }
    return cleaned;
  }
  return obj;
}

// src/promptGenerator.ts
function generatePrompt(frameName, cleanJson) {
  return `Task: Generate HTML and CSS code that replicates this Figma design exactly.

Rules:
- Use only the properties and values from the provided JSON.
- Do not add defaults or assumptions.
- For text elements, use the 'fills' color for text color.

Frame Name: ${frameName}

Design Data (JSON):
${JSON.stringify(cleanJson)}`;
}

// src/code.ts
console.log("Plugin starting...");
figma.showUI(__html__, { width: 800, height: 450 });
console.log("UI shown");
figma.on("selectionchange", updateSelection);
updateSelection();
figma.ui.onmessage = async (msg) => {
  if (msg.type === "generate") {
    await handleGenerate();
  }
};
async function handleGenerate() {
  try {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.ui.postMessage({ type: "error", message: "No selection. Please select a frame, component, or instance." });
      return;
    }
    const node = selection[0];
    if (!(node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE" || node.type === "VECTOR")) {
      figma.ui.postMessage({ type: "error", message: "Please select a frame, component, instance, or vector." });
      return;
    }
    await loadFonts(node);
    const json = cleanObject(await serializeNode(node, { svg: 0, svgCache: /* @__PURE__ */ new Map() }));
    const imageData = collectImageData(json);
    const cleanJson = removeImageDataFromJson(json);
    const prompt = generatePrompt(node.name, cleanJson);
    figma.ui.postMessage({
      type: "result",
      prompt,
      json: JSON.stringify(cleanJson),
      frameName: node.name,
      images: imageData
    });
  } catch (error) {
    console.error("Error in handleGenerate:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    figma.ui.postMessage({ type: "error", message: "An error occurred while generating the prompt: " + errorMessage });
  }
}
