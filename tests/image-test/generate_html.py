import json
import os

def parse_color(color):
    r = int(color['r'] * 255)
    g = int(color['g'] * 255)
    b = int(color['b'] * 255)
    return f'rgb({r}, {g}, {b})'

def parse_fills(fills):
    if not fills:
        return {}
    fill = fills[0]
    if fill['type'] == 'SOLID':
        return {'background-color': parse_color(fill['color'])}
    elif fill['type'] == 'IMAGE':
        image_path = f"images/{fill['imageHash']}.png"
        return {'background-image': f'url({image_path})', 'background-size': 'cover'}
    return {}

def parse_stroke(strokes, stroke_weight):
    if not strokes:
        return {}
    stroke = strokes[0]
    if stroke['type'] == 'SOLID':
        return {'border': f'{stroke_weight}px solid {parse_color(stroke["color"])}'}
    return {}

def parse_text_style(font_name, font_size, text_align_horizontal, text_align_vertical, fills, letter_spacing, line_height):
    style = {}
    if font_name:
        style['font-family'] = font_name['family']
        if 'style' in font_name:
            style['font-weight'] = 'bold' if 'Bold' in font_name['style'] else 'normal'
    style['font-size'] = f'{font_size}px'
    style['text-align'] = text_align_horizontal.lower()
    if fills:
        style['color'] = parse_color(fills[0]['color'])
    if letter_spacing and letter_spacing['unit'] == 'PERCENT':
        style['letter-spacing'] = f'{letter_spacing["value"]}%'
    if line_height and line_height['unit'] == 'PIXELS':
        style['line-height'] = f'{line_height["value"]}px'
    elif line_height and line_height['unit'] == 'PERCENT':
        style['line-height'] = f'{line_height["value"]}%'
    return style

def generate_css(styles):
    css = ''
    for selector, props in styles.items():
        css += f'{selector} {{\n'
        for prop, value in props.items():
            css += f'  {prop}: {value};\n'
        css += '}\n\n'
    return css

def generate_html(node, styles, class_counter):
    if node['type'] == 'FRAME':
        style = {
            'position': 'absolute',
            'left': f'{node["x"]}px',
            'top': f'{node["y"]}px',
            'width': f'{node["width"]}px',
            'height': f'{node["height"]}px',
        }
        if 'layoutMode' in node:
            if node['layoutMode'] == 'VERTICAL':
                style['display'] = 'flex'
                style['flex-direction'] = 'column'
            elif node['layoutMode'] == 'HORIZONTAL':
                style['display'] = 'flex'
                style['flex-direction'] = 'row'
        if 'primaryAxisAlignItems' in node:
            style['justify-content'] = node['primaryAxisAlignItems'].lower().replace('_', '-')
        if 'counterAxisAlignItems' in node:
            style['align-items'] = node['counterAxisAlignItems'].lower().replace('_', '-')
        if 'paddingLeft' in node:
            style['padding-left'] = f'{node["paddingLeft"]}px'
        if 'paddingRight' in node:
            style['padding-right'] = f'{node["paddingRight"]}px'
        if 'paddingTop' in node:
            style['padding-top'] = f'{node["paddingTop"]}px'
        if 'paddingBottom' in node:
            style['padding-bottom'] = f'{node["paddingBottom"]}px'
        if 'itemSpacing' in node:
            style['gap'] = f'{node["itemSpacing"]}px'
        style.update(parse_fills(node.get('fills', [])))
        style.update(parse_stroke(node.get('strokes', []), node.get('strokeWeight', 0)))
        if 'cornerRadius' in node:
            style['border-radius'] = f'{node["cornerRadius"]}px'
        if 'opacity' in node:
            style['opacity'] = str(node['opacity'])

        class_name = f'.class-{class_counter[0]}'
        class_counter[0] += 1
        styles[class_name] = style

        html = f'<div class="{class_name[1:]}">'
        if 'children' in node:
            for child in node['children']:
                html += generate_html(child, styles, class_counter)
        html += '</div>'
        return html

    elif node['type'] == 'RECTANGLE':
        style = {
            'position': 'absolute',
            'left': f'{node["x"]}px',
            'top': f'{node["y"]}px',
            'width': f'{node["width"]}px',
            'height': f'{node["height"]}px',
        }
        style.update(parse_fills(node.get('fills', [])))
        style.update(parse_stroke(node.get('strokes', []), node.get('strokeWeight', 0)))
        if 'cornerRadius' in node:
            style['border-radius'] = f'{node["cornerRadius"]}px'
        if 'opacity' in node:
            style['opacity'] = str(node['opacity'])

        class_name = f'.class-{class_counter[0]}'
        class_counter[0] += 1
        styles[class_name] = style

        return f'<div class="{class_name[1:]}"></div>'

    elif node['type'] == 'TEXT':
        style = {
            'position': 'absolute',
            'left': f'{node["x"]}px',
            'top': f'{node["y"]}px',
            'width': f'{node["width"]}px',
            'height': f'{node["height"]}px',
        }
        style.update(parse_text_style(node.get('fontName'), node.get('fontSize'), node.get('textAlignHorizontal'), node.get('textAlignVertical'), node.get('fills'), node.get('letterSpacing'), node.get('lineHeight')))
        if 'textCase' in node:
            if node['textCase'] == 'UPPER':
                style['text-transform'] = 'uppercase'
        if 'textDecoration' in node:
            style['text-decoration'] = node['textDecoration'].lower()

        class_name = f'.class-{class_counter[0]}'
        class_counter[0] += 1
        styles[class_name] = style

        return f'<div class="{class_name[1:]}">{node["characters"]}</div>'

    elif node['type'] == 'VECTOR':
        # For simplicity, skip vectors or convert to SVG if possible
        return ''

    elif node['type'] == 'ELLIPSE':
        style = {
            'position': 'absolute',
            'left': f'{node["x"]}px',
            'top': f'{node["y"]}px',
            'width': f'{node["width"]}px',
            'height': f'{node["height"]}px',
            'border-radius': '50%',
        }
        style.update(parse_fills(node.get('fills', [])))
        style.update(parse_stroke(node.get('strokes', []), node.get('strokeWeight', 0)))

        class_name = f'.class-{class_counter[0]}'
        class_counter[0] += 1
        styles[class_name] = style

        return f'<div class="{class_name[1:]}"></div>'

    elif node['type'] == 'LINE':
        style = {
            'position': 'absolute',
            'left': f'{node["x"]}px',
            'top': f'{node["y"]}px',
            'width': f'{node["width"]}px',
            'height': f'{node["height"]}px',
        }
        style.update(parse_stroke(node.get('strokes', []), node.get('strokeWeight', 0)))

        class_name = f'.class-{class_counter[0]}'
        class_counter[0] += 1
        styles[class_name] = style

        return f'<div class="{class_name[1:]}"></div>'

    elif node['type'] == 'INSTANCE':
        # Treat as frame
        return generate_html({**node, 'type': 'FRAME'}, styles, class_counter)

    elif node['type'] == 'GROUP':
        # Treat as frame
        return generate_html({**node, 'type': 'FRAME'}, styles, class_counter)

    return ''

def main():
    with open('tests/image-test/prompt.txt', 'r') as f:
        content = f.read()
        # Find the JSON part
        json_start = content.find('{"id":"1:2"')
        json_data = content[json_start:]
        data = json.loads(json_data)

    styles = {}
    class_counter = [0]
    html = generate_html(data, styles, class_counter)

    css = generate_css(styles)

    with open('tests/image-test/image-test.html', 'w') as f:
        f.write(f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Figma Design</title>
    <style>
{css}
    </style>
</head>
<body>
{html}
</body>
</html>''')

if __name__ == '__main__':
    main()