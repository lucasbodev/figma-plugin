export async function processPaint(paint: Paint): Promise<any> {
  if (paint.type === 'SOLID') {
    const { r, g, b } = paint.color;
    const hex = '#' + [r, g, b].map(c => Math.round(c * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
    return Object.assign({}, paint, { hex: hex });
  } else if (paint.type === 'IMAGE' && paint.imageHash) {
    const image = figma.getImageByHash(paint.imageHash);
    if (image) {
      const bytes = await image.getBytesAsync();
      // Return image data for UI processing and relative path for JSON
      const base64 = figma.base64Encode(bytes);
      return Object.assign({}, paint, {
        imagePath: `assets/images/${paint.imageHash}.png`,
        imageData: base64 // Keep for UI display and ZIP creation
      });
    }
  }
  return paint;
}

export async function serializeNode(node: SceneNode, counters: { svg: number; svgCache: Map<string, string> } = { svg: 0, svgCache: new Map() }): Promise<any> {
  const base = {
    id: node.id,
    name: node.name,
    type: node.type,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    visible: node.visible,
    opacity: (node as any).opacity,
    blendMode: (node as any).blendMode,
    effects: (node as any).effects,
    rotation: (node as any).rotation,
  };

  if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
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
      backgrounds: Array.isArray((node as any).backgrounds) ? await Promise.all((node as any).backgrounds.map(processPaint)) : (node as any).backgrounds,
      strokes: Array.isArray(node.strokes) ? await Promise.all(node.strokes.map(processPaint)) : node.strokes,
      strokeWeight: node.strokeWeight,
      individualStrokeWeights: (node as any).individualStrokeWeights,
      strokeAlign: (node as any).strokeAlign,
      strokeDashes: (node as any).strokeDashes,
      strokesIncludedInLayout: (node as any).strokesIncludedInLayout,
      cornerRadius: node.cornerRadius,
      clipsContent: node.clipsContent,
      layoutGrids: (node as any).layoutGrids,
      constraints: node.constraints,
      boundVariables: (node as any).boundVariables,
      componentProperties: (node as any).componentProperties,
      mainComponent: (node as any).mainComponent,
      scaleFactor: (node as any).scaleFactor,
      variantProperties: (node as any).variantProperties,
      overriddenSymbolID: (node as any).overriddenSymbolID,
      children: await Promise.all(node.children.map(child => serializeNode(child, counters))),
    };
  } else if (node.type === 'TEXT') {
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
      boundVariables: (node as any).boundVariables,
    };
  } else if (node.type === 'VECTOR') {
    // Export as SVG
    const svgString = await node.exportAsync({ format: 'SVG' });
    const svgData = figma.base64Encode(svgString);

    // Check if this SVG has been seen before
    let svgPath: string;
    if (counters.svgCache.has(svgData)) {
      svgPath = counters.svgCache.get(svgData)!;
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
      individualStrokeWeights: (node as any).individualStrokeWeights,
      strokeAlign: (node as any).strokeAlign,
      strokeDashes: (node as any).strokeDashes,
      strokesIncludedInLayout: (node as any).strokesIncludedInLayout,
      vectorPaths: node.vectorPaths,
      svgPath: svgPath,
      svgData: svgData, // Keep for UI display and ZIP creation
      boundVariables: (node as any).boundVariables,
    };
  } else if (node.type === 'GROUP') {
    // Check if all children are VECTOR nodes
    const allVectors = node.children.every(child => child.type === 'VECTOR');

    if (allVectors && node.children.length > 1) {
      // Export the entire group as a single SVG
      const svgString = await node.exportAsync({ format: 'SVG' });
      const svgData = figma.base64Encode(svgString);

      // Check if this SVG has been seen before
      let svgPath: string;
      if (counters.svgCache.has(svgData)) {
        svgPath = counters.svgCache.get(svgData)!;
      } else {
        svgPath = `assets/icons/icon-${++counters.svg}.svg`;
        counters.svgCache.set(svgData, svgPath);
      }

      // Serialize children without generating individual SVG files
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
          opacity: (child as any).opacity,
          blendMode: (child as any).blendMode,
          effects: (child as any).effects,
          rotation: (child as any).rotation,
        };

        return Object.assign({}, childBase, {
          fills: Array.isArray(child.fills) ? await Promise.all(child.fills.map(processPaint)) : child.fills,
          strokes: Array.isArray(child.strokes) ? await Promise.all(child.strokes.map(processPaint)) : child.strokes,
          strokeWeight: child.strokeWeight,
          individualStrokeWeights: (child as any).individualStrokeWeights,
          strokeAlign: (child as any).strokeAlign,
          strokeDashes: (child as any).strokeDashes,
          strokesIncludedInLayout: (child as any).strokesIncludedInLayout,
          vectorPaths: child.vectorPaths,
          boundVariables: (child as any).boundVariables,
        });
      }));

      return Object.assign({}, base, {
        type: 'VECTOR_GROUP', // New type to indicate grouped vectors
        svgPath: svgPath,
        svgData: svgData,
        children: children, // Keep children for reference but without individual SVG data
      });
    } else {
      const children = await Promise.all(node.children.map(child => serializeNode(child, counters)));
      return Object.assign({}, base, {
        children: children,
      });
    }
  } else if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE' || node.type === 'POLYGON' || node.type === 'STAR') {
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
      cornerRadius: node.cornerRadius,
    };
  } else {
    return base;
  }
}