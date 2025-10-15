import { readFileSync, writeFileSync } from 'fs';

interface Color {
  r: number;
  g: number;
  b: number;
}

interface Fill {
  type: string;
  color?: Color;
  imageHash?: string;
}

interface Stroke {
  type: string;
  color?: Color;
}

interface FontName {
  family: string;
  style?: string;
}

interface LetterSpacing {
  unit: string;
  value: number;
}

interface LineHeight {
  unit: string;
  value: number;
}

interface Node {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fills?: Fill[];
  strokes?: Stroke[];
  strokeWeight?: number;
  cornerRadius?: number;
  opacity?: number;
  layoutMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  children?: Node[];
  fontName?: FontName;
  fontSize?: number;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
  letterSpacing?: LetterSpacing;
  lineHeight?: LineHeight;
  textCase?: string;
  textDecoration?: string;
  characters?: string;
}

function parseColor(color: Color): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `rgb(${r}, ${g}, ${b})`;
}

function parseFills(fills?: Fill[]): Record<string, string> {
  if (!fills || fills.length === 0) return {};
  const fill = fills[0];
  if (fill.type === 'SOLID' && fill.color) {
    return { 'background-color': parseColor(fill.color) };
  } else if (fill.type === 'IMAGE' && fill.imageHash) {
    const imagePath = `images/${fill.imageHash}.png`;
    return { 'background-image': `url(${imagePath})`, 'background-size': 'cover' };
  }
  return {};
}

function parseStroke(strokes?: Stroke[], strokeWeight?: number): Record<string, string> {
  if (!strokes || strokes.length === 0) return {};
  const stroke = strokes[0];
  if (stroke.type === 'SOLID' && stroke.color) {
    return { 'border': `${strokeWeight || 0}px solid ${parseColor(stroke.color)}` };
  }
  return {};
}

function parseTextStyle(
  fontName?: FontName,
  fontSize?: number,
  textAlignHorizontal?: string,
  textAlignVertical?: string,
  fills?: Fill[],
  letterSpacing?: LetterSpacing,
  lineHeight?: LineHeight
): Record<string, string> {
  const style: Record<string, string> = {};
  if (fontName) {
    style['font-family'] = fontName.family;
    if (fontName.style && fontName.style.includes('Bold')) {
      style['font-weight'] = 'bold';
    }
  }
  if (fontSize !== undefined) style['font-size'] = `${fontSize}px`;
  if (textAlignHorizontal) style['text-align'] = textAlignHorizontal.toLowerCase();
  if (fills && fills.length > 0 && fills[0].color) {
    style['color'] = parseColor(fills[0].color);
  }
  if (letterSpacing && letterSpacing.unit === 'PERCENT') {
    style['letter-spacing'] = `${letterSpacing.value}%`;
  }
  if (lineHeight) {
    if (lineHeight.unit === 'PIXELS') {
      style['line-height'] = `${lineHeight.value}px`;
    } else if (lineHeight.unit === 'PERCENT') {
      style['line-height'] = `${lineHeight.value}%`;
    }
  }
  return style;
}

function generateCSS(styles: Record<string, Record<string, string>>): string {
  let css = '';
  for (const [selector, props] of Object.entries(styles)) {
    css += `${selector} {\n`;
    for (const [prop, value] of Object.entries(props)) {
      css += `  ${prop}: ${value};\n`;
    }
    css += '}\n\n';
  }
  return css;
}

function generateHTML(node: Node, styles: Record<string, Record<string, string>>, classCounter: number[]): string {
  if (node.type === 'FRAME') {
    const style: Record<string, string> = {
      'position': 'absolute',
      'left': `${node.x}px`,
      'top': `${node.y}px`,
      'width': `${node.width}px`,
      'height': `${node.height}px`,
    };
    if (node.layoutMode === 'VERTICAL') {
      style['display'] = 'flex';
      style['flex-direction'] = 'column';
    } else if (node.layoutMode === 'HORIZONTAL') {
      style['display'] = 'flex';
      style['flex-direction'] = 'row';
    }
    if (node.primaryAxisAlignItems) {
      style['justify-content'] = node.primaryAxisAlignItems.toLowerCase().replace('_', '-');
    }
    if (node.counterAxisAlignItems) {
      style['align-items'] = node.counterAxisAlignItems.toLowerCase().replace('_', '-');
    }
    if (node.paddingLeft !== undefined) style['padding-left'] = `${node.paddingLeft}px`;
    if (node.paddingRight !== undefined) style['padding-right'] = `${node.paddingRight}px`;
    if (node.paddingTop !== undefined) style['padding-top'] = `${node.paddingTop}px`;
    if (node.paddingBottom !== undefined) style['padding-bottom'] = `${node.paddingBottom}px`;
    if (node.itemSpacing !== undefined) style['gap'] = `${node.itemSpacing}px`;
    Object.assign(style, parseFills(node.fills));
    Object.assign(style, parseStroke(node.strokes, node.strokeWeight || 0));
    if (node.cornerRadius !== undefined) style['border-radius'] = `${node.cornerRadius}px`;
    if (node.opacity !== undefined) style['opacity'] = node.opacity.toString();

    const className = `.class-${classCounter[0]}`;
    classCounter[0]++;
    styles[className] = style;

    let html = `<div class="${className.slice(1)}">`;
    if (node.children) {
      for (const child of node.children) {
        html += generateHTML(child, styles, classCounter);
      }
    }
    html += '</div>';
    return html;
  } else if (node.type === 'RECTANGLE') {
    const style: Record<string, string> = {
      'position': 'absolute',
      'left': `${node.x}px`,
      'top': `${node.y}px`,
      'width': `${node.width}px`,
      'height': `${node.height}px`,
    };
    Object.assign(style, parseFills(node.fills));
    Object.assign(style, parseStroke(node.strokes, node.strokeWeight || 0));
    if (node.cornerRadius !== undefined) style['border-radius'] = `${node.cornerRadius}px`;
    if (node.opacity !== undefined) style['opacity'] = node.opacity.toString();

    const className = `.class-${classCounter[0]}`;
    classCounter[0]++;
    styles[className] = style;

    return `<div class="${className.slice(1)}"></div>`;
  } else if (node.type === 'TEXT') {
    const style: Record<string, string> = {
      'position': 'absolute',
      'left': `${node.x}px`,
      'top': `${node.y}px`,
      'width': `${node.width}px`,
      'height': `${node.height}px`,
    };
    Object.assign(style, parseTextStyle(node.fontName, node.fontSize, node.textAlignHorizontal, node.textAlignVertical, node.fills, node.letterSpacing, node.lineHeight));
    if (node.textCase === 'UPPER') {
      style['text-transform'] = 'uppercase';
    }
    if (node.textDecoration) {
      style['text-decoration'] = node.textDecoration.toLowerCase();
    }

    const className = `.class-${classCounter[0]}`;
    classCounter[0]++;
    styles[className] = style;

    return `<div class="${className.slice(1)}">${node.characters || ''}</div>`;
  } else if (node.type === 'VECTOR') {
    // Skip for now
    return '';
  } else if (node.type === 'ELLIPSE') {
    const style: Record<string, string> = {
      'position': 'absolute',
      'left': `${node.x}px`,
      'top': `${node.y}px`,
      'width': `${node.width}px`,
      'height': `${node.height}px`,
      'border-radius': '50%',
    };
    Object.assign(style, parseFills(node.fills));
    Object.assign(style, parseStroke(node.strokes, node.strokeWeight || 0));

    const className = `.class-${classCounter[0]}`;
    classCounter[0]++;
    styles[className] = style;

    return `<div class="${className.slice(1)}"></div>`;
  } else if (node.type === 'LINE') {
    const style: Record<string, string> = {
      'position': 'absolute',
      'left': `${node.x}px`,
      'top': `${node.y}px`,
      'width': `${node.width}px`,
      'height': `${node.height}px`,
    };
    Object.assign(style, parseStroke(node.strokes, node.strokeWeight || 0));

    const className = `.class-${classCounter[0]}`;
    classCounter[0]++;
    styles[className] = style;

    return `<div class="${className.slice(1)}"></div>`;
  } else if (node.type === 'INSTANCE') {
    return generateHTML({ ...node, type: 'FRAME' }, styles, classCounter);
  } else if (node.type === 'GROUP') {
    return generateHTML({ ...node, type: 'FRAME' }, styles, classCounter);
  }
  return '';
}

function main(): void {
  const content = readFileSync('tests/image-test/prompt.txt', 'utf8');
  const jsonStart = content.indexOf('{"id":"1:2"');
  const jsonData = content.slice(jsonStart);
  const data: Node = JSON.parse(jsonData);

  const styles: Record<string, Record<string, string>> = {};
  const classCounter = [0];
  const html = generateHTML(data, styles, classCounter);

  const css = generateCSS(styles);

  const output = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Figma Design</title>
    <style>
${css}
    </style>
</head>
<body>
${html}
</body>
</html>`;

  writeFileSync('tests/image-test/image-test.html', output);
  console.log('HTML and CSS generated successfully');
}

main();