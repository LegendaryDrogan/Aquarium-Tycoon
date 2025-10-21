#!/usr/bin/env python3
"""
Enhanced Fish Sprite Generator for Aquarium Tycoon v5.0
Creates highly detailed, realistic pixel art sprites
"""

from PIL import Image, ImageDraw
import colorsys

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(r, g, b):
    return '#{:02x}{:02x}{:02x}'.format(r, g, b)

def lighten(rgb, factor=0.3):
    return tuple(min(255, int(c + (255 - c) * factor)) for c in rgb)

def darken(rgb, factor=0.3):
    return tuple(max(0, int(c * (1 - factor))) for c in rgb)

def blend(rgb1, rgb2, t=0.5):
    return tuple(int(c1 * (1-t) + c2 * t) for c1, c2 in zip(rgb1, rgb2))

def add_noise(rgb, variation=10):
    import random
    return tuple(max(0, min(255, c + random.randint(-variation, variation))) for c in rgb)

# ============================================================================
# GUPPY - Small colorful tropical fish with fancy tail
# ============================================================================
def draw_guppy(img, colors):
    draw = ImageDraw.Draw(img)
    top = hex_to_rgb(colors['top'])
    belly = hex_to_rgb(colors['belly'])
    fin = hex_to_rgb(colors['fin'])

    top_d, top_l = darken(top, 0.4), lighten(top, 0.2)
    belly_l = lighten(belly, 0.3)
    fin_d, fin_l = darken(fin, 0.3), lighten(fin, 0.4)

    # Large fancy tail with detailed rays (128x64 canvas)
    for y in range(12, 52):
        for x in range(4, 42):
            dist_center = abs(y - 32)
            dist_x = x - 4
            tail_shape = dist_center + dist_x * 0.5

            if tail_shape < 28:
                # Fin rays every 4 pixels
                if dist_x % 4 == 0:
                    img.putpixel((x, y), fin_l)
                elif dist_x % 4 == 1:
                    img.putpixel((x, y), fin)
                else:
                    # Gradient based on distance
                    t = dist_x / 38
                    color = blend(fin_l, fin_d, t)
                    img.putpixel((x, y), color)

    # Body - elliptical shape
    for y in range(20, 44):
        for x in range(40, 80):
            dx = (x - 60) / 20
            dy = (y - 32) / 12
            if dx*dx + dy*dy < 1:
                # Top half darker, belly lighter
                if y < 32:
                    t = (32 - y) / 12
                    color = blend(belly, top, t)
                else:
                    t = (y - 32) / 12
                    color = blend(belly, belly_l, t)

                # Add scale pattern
                if (x + y) % 4 < 2:
                    color = lighten(color, 0.1)

                img.putpixel((x, y), color)

    # Dorsal fin
    for y in range(14, 24):
        for x in range(52, 68):
            dy = (24 - y)
            dx = abs(x - 60)
            if dy > dx * 0.5 and dy < 10:
                if x % 3 == 0:
                    img.putpixel((x, y), fin_l)
                else:
                    img.putpixel((x, y), fin)

    # Pectoral fins (side)
    for offset in [-8, 8]:
        for y in range(28, 38):
            for x in range(56, 66):
                dy = abs(y - 32 - offset)
                dx = x - 56
                if dy < 6 - dx * 0.6 and dx < 10:
                    img.putpixel((x, y + offset), blend(fin, fin_d, 0.3))

    # Eye - large and detailed
    eye_x, eye_y = 70, 28
    # White of eye
    draw.ellipse([eye_x-4, eye_y-4, eye_x+4, eye_y+4], fill=(255, 255, 255))
    # Iris
    draw.ellipse([eye_x-3, eye_y-3, eye_x+3, eye_y+3], fill=(50, 50, 50))
    # Pupil
    draw.ellipse([eye_x-2, eye_y-2, eye_x+2, eye_y+2], fill=(0, 0, 0))
    # Highlight
    draw.ellipse([eye_x-1, eye_y-2, eye_x+1, eye_y], fill=(255, 255, 255))

    # Mouth
    draw.line([76, 32, 78, 32], fill=darken(top, 0.6), width=1)

# ============================================================================
# GOLDFISH - Round body, flowing fins, metallic orange
# ============================================================================
def draw_goldfish(img, colors):
    draw = ImageDraw.Draw(img)
    body = hex_to_rgb(colors['body'])
    fins = hex_to_rgb(colors['fins'])

    body_l = lighten(body, 0.3)
    body_d = darken(body, 0.3)
    fins_l = lighten(fins, 0.2)

    # Round body (128x64)
    for y in range(16, 48):
        for x in range(50, 90):
            dx = (x - 70) / 20
            dy = (y - 32) / 16
            if dx*dx + dy*dy < 1:
                # Metallic shimmer effect
                shimmer = (x + y * 2) % 8
                if shimmer < 3:
                    color = body_l
                elif y < 32:
                    color = body
                else:
                    color = blend(body, body_l, 0.3)

                # Scale pattern
                if (x % 5 == 0) or (y % 5 == 0):
                    color = lighten(color, 0.15)

                img.putpixel((x, y), color)

    # Flowing tail
    for y in range(18, 46):
        for x in range(10, 50):
            dist = abs(y - 32) + (x - 10) * 0.4
            if dist < 20:
                # Flowing layers
                layer = (x - 10) % 6
                if layer < 2:
                    color = fins_l
                elif layer < 4:
                    color = fins
                else:
                    color = blend(fins, body, 0.3)
                img.putpixel((x, y), color)

    # Dorsal fin (tall and flowing)
    for y in range(8, 20):
        for x in range(60, 75):
            dy = 20 - y
            dx = abs(x - 67)
            if dy > dx * 0.8:
                if x % 3 == 0:
                    img.putpixel((x, y), fins_l)
                else:
                    img.putpixel((x, y), fins)

    # Pectoral fins
    for y in range(26, 38):
        for x in range(58, 68):
            dy = abs(y - 32)
            dx = x - 58
            if dy < 8 - dx * 0.8:
                img.putpixel((x, y), blend(fins, fins_l, 0.5))

    # Large eye
    eye_x, eye_y = 78, 26
    draw.ellipse([eye_x-5, eye_y-5, eye_x+5, eye_y+5], fill=(255, 255, 255))
    draw.ellipse([eye_x-3, eye_y-3, eye_x+3, eye_y+3], fill=(30, 30, 30))
    draw.ellipse([eye_x-2, eye_y-2, eye_x+2, eye_y+2], fill=(0, 0, 0))
    draw.ellipse([eye_x-1, eye_y-2, eye_x+1, eye_y], fill=(255, 255, 255))

    # Mouth (small O shape)
    draw.ellipse([85, 30, 89, 34], fill=darken(body, 0.5))

# ============================================================================
# SQUID - Elongated body with tentacles
# ============================================================================
def draw_squid(img, colors):
    draw = ImageDraw.Draw(img)
    body = hex_to_rgb(colors['body'])
    tentacles = hex_to_rgb(colors['tentacles'])

    body_l = lighten(body, 0.2)
    body_d = darken(body, 0.3)
    tent_d = darken(tentacles, 0.2)

    # Mantle (elongated body)
    for y in range(20, 44):
        for x in range(60, 100):
            dx = (x - 80) / 20
            dy = (y - 32) / 12
            if dx*dx + dy*dy < 1:
                # Gradient from back to front
                t = (x - 60) / 40
                color = blend(body_d, body_l, t)

                # Texture spots
                if (x * 3 + y * 2) % 9 < 3:
                    color = darken(color, 0.15)

                img.putpixel((x, y), color)

    # Tentacles (8 of them)
    tentacle_positions = [
        (24, 0), (26, 3), (28, -2), (30, 4),
        (34, 1), (36, -3), (38, 2), (40, -1)
    ]

    for x_offset, y_offset in tentacle_positions:
        for x in range(20, 62):
            wave = y_offset + (x % 8 - 4) * 0.5
            y = int(32 + wave + (x - 20) * 0.1)
            if 0 <= y < 64:
                # Tapering width
                width = max(1, 3 - (x - 20) // 15)
                for dy in range(-width, width + 1):
                    if 0 <= y + dy < 64:
                        # Sucker pattern every 8 pixels
                        if (x % 8 < 3) and abs(dy) < width - 1:
                            img.putpixel((x - x_offset, y + dy), lighten(tentacles, 0.3))
                        else:
                            color = tent_d if abs(dy) == width else tentacles
                            img.putpixel((x - x_offset, y + dy), color)

    # Eyes (large and intelligent)
    for eye_x in [88, 88]:
        eye_y = 32
        draw.ellipse([eye_x-6, eye_y-6, eye_x+6, eye_y+6], fill=(255, 255, 255))
        draw.ellipse([eye_x-4, eye_y-4, eye_x+4, eye_y+4], fill=(40, 40, 40))
        draw.ellipse([eye_x-3, eye_y-3, eye_x+3, eye_y+3], fill=(0, 0, 0))
        draw.ellipse([eye_x-1, eye_y-2, eye_x+1, eye_y], fill=(255, 255, 255))

    # Fins on sides
    for y in range(22, 42):
        for x in range(70, 85):
            dy = abs(y - 32)
            if dy < 12 and (x % 4 < 2):
                img.putpixel((x, y), blend(body, body_l, 0.6))

# ============================================================================
# KOI - Japanese carp with distinctive patches
# ============================================================================
def draw_koi(img, colors):
    draw = ImageDraw.Draw(img)
    base = hex_to_rgb(colors['base'])
    orange = hex_to_rgb(colors['orange'])
    black = hex_to_rgb(colors['black'])

    base_l = lighten(base, 0.2)
    orange_d = darken(orange, 0.2)

    # Elongated body
    for y in range(18, 46):
        for x in range(45, 95):
            dx = (x - 70) / 25
            dy = (y - 32) / 14
            if dx*dx + dy*dy < 1:
                # Base white color
                color = base if y < 32 else base_l

                # Orange patches (distinctive koi pattern)
                patch1 = ((x - 55)**2 + (y - 25)**2) < 80
                patch2 = ((x - 75)**2 + (y - 38)**2) < 100

                if patch1 or patch2:
                    color = orange if y < 32 else orange_d

                # Black accents
                if ((x - 85)**2 + (y - 30)**2) < 30:
                    color = black

                # Scale texture
                if (x + y) % 5 < 2:
                    color = lighten(color, 0.1)

                img.putpixel((x, y), color)

    # Flowing tail
    for y in range(22, 42):
        for x in range(15, 45):
            dist = abs(y - 32) + (x - 15) * 0.5
            if dist < 18:
                if (x % 5 < 2):
                    color = lighten(orange, 0.2)
                else:
                    color = orange
                img.putpixel((x, y), color)

    # Whiskers (barbels)
    for offset in [-6, 6]:
        for x in range(90, 100):
            y = 32 + offset + (x - 90) // 3
            if 0 <= y < 64:
                img.putpixel((x, y), black)

    # Eye
    eye_x, eye_y = 82, 28
    draw.ellipse([eye_x-4, eye_y-4, eye_x+4, eye_y+4], fill=(255, 255, 255))
    draw.ellipse([eye_x-3, eye_y-3, eye_x+3, eye_y+3], fill=(40, 30, 20))
    draw.ellipse([eye_x-2, eye_y-2, eye_x+2, eye_y+2], fill=(0, 0, 0))
    draw.ellipse([eye_x-1, eye_y-2, eye_x+1, eye_y], fill=(255, 255, 255))

    # Dorsal fin
    for y in range(10, 20):
        for x in range(62, 75):
            dy = 20 - y
            dx = abs(x - 68)
            if dy > dx * 0.6:
                img.putpixel((x, y), orange if x % 3 == 0 else orange_d)

# ============================================================================
# ANGELFISH - Tall triangular shape with elegant fins
# ============================================================================
def draw_angelfish(img, colors):
    draw = ImageDraw.Draw(img)
    body = hex_to_rgb(colors['body'])
    stripes = hex_to_rgb(colors['stripes'])
    fins = hex_to_rgb(colors['fins'])

    body_l = lighten(body, 0.2)
    body_d = darken(body, 0.2)

    # Tall compressed body
    for y in range(8, 56):
        for x in range(55, 85):
            # Diamond/triangular shape
            center_y = 32
            center_x = 70
            dy = abs(y - center_y) / 24
            dx = abs(x - center_x) / 15

            if dy + dx < 1:
                # Vertical stripes
                if (x % 8 < 3):
                    color = stripes
                else:
                    color = body if y < 32 else body_l

                # Scale texture
                if (x + y) % 6 < 2:
                    color = lighten(color, 0.1)

                img.putpixel((x, y), color)

    # Long dorsal fin (top)
    for y in range(2, 14):
        for x in range(60, 78):
            dy = 14 - y
            dx = abs(x - 69)
            if dy > dx * 0.5:
                if x % 4 < 2:
                    img.putpixel((x, y), lighten(fins, 0.2))
                else:
                    img.putpixel((x, y), fins)

    # Long anal fin (bottom)
    for y in range(50, 62):
        for x in range(60, 78):
            dy = y - 50
            dx = abs(x - 69)
            if dy > dx * 0.5:
                if x % 4 < 2:
                    img.putpixel((x, y), lighten(fins, 0.2))
                else:
                    img.putpixel((x, y), fins)

    # Pointed tail
    for y in range(20, 44):
        for x in range(35, 55):
            dist = abs(y - 32) + (55 - x) * 0.6
            if dist < 16:
                img.putpixel((x, y), fins if (x + y) % 3 else lighten(fins, 0.15))

    # Eye
    eye_x, eye_y = 72, 28
    draw.ellipse([eye_x-4, eye_y-4, eye_x+4, eye_y+4], fill=(255, 255, 255))
    draw.ellipse([eye_x-3, eye_y-3, eye_x+3, eye_y+3], fill=(200, 150, 0))
    draw.ellipse([eye_x-2, eye_y-2, eye_x+2, eye_y+2], fill=(0, 0, 0))
    draw.ellipse([eye_x-1, eye_y-2, eye_x+1, eye_y], fill=(255, 255, 255))

# ============================================================================
# DISCUS - Round flat body with intricate patterns
# ============================================================================
def draw_discus(img, colors):
    draw = ImageDraw.Draw(img)
    body = hex_to_rgb(colors['body'])
    pattern = hex_to_rgb(colors['pattern'])
    fins = hex_to_rgb(colors['fins'])

    body_l = lighten(body, 0.2)
    body_d = darken(body, 0.2)
    pattern_l = lighten(pattern, 0.2)

    # Very round, disk-like body
    for y in range(12, 52):
        for x in range(52, 92):
            dx = (x - 72) / 20
            dy = (y - 32) / 20
            if dx*dx + dy*dy < 1:
                # Intricate horizontal line pattern (like real discus)
                if y % 3 == 0:
                    color = pattern if y % 6 == 0 else pattern_l
                else:
                    color = body if y < 32 else body_l

                # Radial shading
                dist = (dx*dx + dy*dy) ** 0.5
                if dist > 0.7:
                    color = darken(color, 0.2)

                img.putpixel((x, y), color)

    # Long dorsal fin along top
    for y in range(6, 16):
        for x in range(56, 88):
            dy = 16 - y
            if dy > 0 and dy < 10:
                if x % 5 < 2:
                    img.putpixel((x, y), lighten(fins, 0.3))
                else:
                    img.putpixel((x, y), fins)

    # Long anal fin along bottom
    for y in range(48, 58):
        for x in range(56, 88):
            dy = y - 48
            if dy > 0 and dy < 10:
                if x % 5 < 2:
                    img.putpixel((x, y), lighten(fins, 0.3))
                else:
                    img.putpixel((x, y), fins)

    # Small tail
    for y in range(24, 40):
        for x in range(38, 52):
            dist = abs(y - 32) + (52 - x) * 0.7
            if dist < 12:
                img.putpixel((x, y), fins)

    # Eye with red accent (discus have red eyes)
    eye_x, eye_y = 78, 26
    draw.ellipse([eye_x-5, eye_y-5, eye_x+5, eye_y+5], fill=(255, 200, 200))
    draw.ellipse([eye_x-3, eye_y-3, eye_x+3, eye_y+3], fill=(180, 50, 50))
    draw.ellipse([eye_x-2, eye_y-2, eye_x+2, eye_y+2], fill=(80, 0, 0))
    draw.ellipse([eye_x-1, eye_y-2, eye_x+1, eye_y], fill=(255, 255, 255))

# ============================================================================
# EEL - Long serpentine body
# ============================================================================
def draw_eel(img, colors):
    draw = ImageDraw.Draw(img)
    body = hex_to_rgb(colors['body'])
    belly = hex_to_rgb(colors['belly'])

    body_d = darken(body, 0.3)
    belly_l = lighten(belly, 0.2)

    # Serpentine body - wave pattern
    for x in range(10, 118):
        # Sine wave for eel shape
        progress = (x - 10) / 108
        wave = 32 + int(8 * ((x / 12) % 1 - 0.5) * 2)

        # Body thickness (thicker in middle, tapers at ends)
        if progress < 0.3:
            thickness = int(6 + progress * 20)
        elif progress > 0.7:
            thickness = int(12 - (progress - 0.7) * 30)
        else:
            thickness = 12

        for dy in range(-thickness, thickness + 1):
            y = wave + dy
            if 0 <= y < 64:
                # Top darker, belly lighter
                if dy < 0:
                    t = abs(dy) / thickness
                    color = blend(belly, body, t)
                else:
                    t = dy / thickness
                    color = blend(belly, belly_l, t * 0.5)

                # Spots pattern
                if (x * 5 + y * 3) % 17 < 5:
                    color = darken(color, 0.2)

                img.putpixel((x, y), color)

    # Dorsal fin ridge along back
    for x in range(40, 110):
        wave = 32 + int(8 * ((x / 12) % 1 - 0.5) * 2)
        for dy in range(-14, -8):
            y = wave + dy
            if 0 <= y < 64 and (x % 4 < 2):
                img.putpixel((x, y), blend(body, body_d, 0.5))

    # Eye near front
    eye_x, eye_y = 98, 28
    draw.ellipse([eye_x-3, eye_y-3, eye_x+3, eye_y+3], fill=(255, 255, 255))
    draw.ellipse([eye_x-2, eye_y-2, eye_x+2, eye_y+2], fill=(40, 40, 40))
    draw.ellipse([eye_x-1, eye_y-1, eye_x+1, eye_y+1], fill=(0, 0, 0))

    # Small mouth
    draw.line([105, 32, 110, 32], fill=darken(body, 0.5), width=2)

# ============================================================================
# TURTLE - Shell with flippers
# ============================================================================
def draw_turtle(img, colors):
    draw = ImageDraw.Draw(img)
    shell = hex_to_rgb(colors['shell'])
    skin = hex_to_rgb(colors['skin'])
    pattern = hex_to_rgb(colors['pattern'])

    shell_d = darken(shell, 0.3)
    shell_l = lighten(shell, 0.2)
    skin_d = darken(skin, 0.2)

    # Shell (dome shape)
    for y in range(16, 48):
        for x in range(50, 90):
            dx = (x - 70) / 20
            dy = (y - 32) / 16
            if dx*dx + dy*dy < 1:
                # Hexagonal pattern on shell
                hex_x = (x - 50) // 12
                hex_y = (y - 16) // 12

                if ((x - 50) % 12 < 2) or ((y - 16) % 12 < 2):
                    color = pattern
                else:
                    # 3D shading on shell
                    height = 1 - (dx*dx + dy*dy)
                    if height > 0.6:
                        color = shell_l
                    elif height > 0.3:
                        color = shell
                    else:
                        color = shell_d

                img.putpixel((x, y), color)

    # Head (protruding)
    for y in range(26, 38):
        for x in range(88, 104):
            dx = (x - 96) / 8
            dy = (y - 32) / 6
            if dx*dx + dy*dy < 1:
                color = skin if y < 32 else skin_d
                img.putpixel((x, y), color)

    # Front flippers
    for y_offset, y_base in [(-12, 20), (12, 44)]:
        for y in range(y_base - 6, y_base + 6):
            for x in range(70, 85):
                dy = abs(y - y_base)
                dx = x - 70
                if dy < 8 - dx * 0.5:
                    color = skin if dy < 4 else skin_d
                    img.putpixel((x, y), color)

    # Back flippers
    for y_offset, y_base in [(-10, 22), (10, 42)]:
        for y in range(y_base - 5, y_base + 5):
            for x in range(48, 60):
                dy = abs(y - y_base)
                dx = 60 - x
                if dy < 6 - dx * 0.4:
                    color = skin if dy < 3 else skin_d
                    img.putpixel((x, y), color)

    # Eye
    eye_x, eye_y = 100, 30
    draw.ellipse([eye_x-3, eye_y-3, eye_x+3, eye_y+3], fill=(255, 255, 255))
    draw.ellipse([eye_x-2, eye_y-2, eye_x+2, eye_y+2], fill=(40, 40, 0))
    draw.ellipse([eye_x-1, eye_y-1, eye_x+1, eye_y+1], fill=(0, 0, 0))

    # Nostrils
    img.putpixel((105, 30), (0, 0, 0))
    img.putpixel((105, 34), (0, 0, 0))

# ============================================================================
# SHARK - Sleek predator with distinctive fins
# ============================================================================
def draw_shark(img, colors):
    draw = ImageDraw.Draw(img)
    top = hex_to_rgb(colors['top'])
    belly = hex_to_rgb(colors['belly'])

    top_d = darken(top, 0.3)
    belly_l = lighten(belly, 0.2)

    # Streamlined body
    for y in range(18, 46):
        for x in range(35, 105):
            # Tapered torpedo shape
            progress = (x - 35) / 70

            if progress < 0.6:
                width = 14 * (1 - abs(progress - 0.3) / 0.3)
            else:
                width = 14 * (1 - (progress - 0.6) / 0.4)

            dy = abs(y - 32)
            if dy < width:
                # Top grey, belly white
                if y < 32:
                    t = (32 - y) / width
                    color = blend(belly, top, t)
                else:
                    t = (y - 32) / width
                    color = blend(belly, belly_l, t * 0.5)

                # Subtle scales
                if (x * 7 + y * 3) % 23 < 2:
                    color = darken(color, 0.1)

                img.putpixel((x, y), color)

    # Dorsal fin (iconic triangle)
    for y in range(4, 20):
        for x in range(62, 75):
            dy = 20 - y
            dx = abs(x - 68)
            if dy > dx * 1.2 and dy > 2:
                color = top if dy > dx * 1.5 else top_d
                img.putpixel((x, y), color)

    # Pectoral fins (side)
    for y in range(28, 42):
        for x in range(58, 72):
            dy = abs(y - 35)
            dx = x - 58
            if dy < 10 - dx * 0.7:
                color = blend(top, belly, 0.5) if dy < 5 else darken(top, 0.2)
                img.putpixel((x, y), color)

    # Tail (powerful crescent)
    for y in range(12, 52):
        for x in range(15, 38):
            # Upper and lower tail lobes
            if y < 28:
                dist = abs(y - 12) + (38 - x) * 0.8
                if dist < 20:
                    img.putpixel((x, y), top if (x % 3) else top_d)
            else:
                dist = abs(y - 52) + (38 - x) * 0.8
                if dist < 20:
                    img.putpixel((x, y), top if (x % 3) else top_d)

    # Teeth (rows in mouth)
    for x in range(95, 105):
        for tooth_y in [30, 32, 34]:
            if x % 3 == 0:
                img.putpixel((x, tooth_y), (255, 255, 255))

    # Eye (dark and focused)
    eye_x, eye_y = 92, 26
    draw.ellipse([eye_x-4, eye_y-4, eye_x+4, eye_y+4], fill=(40, 40, 40))
    draw.ellipse([eye_x-3, eye_y-3, eye_x+3, eye_y+3], fill=(0, 0, 0))
    draw.ellipse([eye_x-1, eye_y-2, eye_x, eye_y-1], fill=(100, 100, 100))

    # Gills
    for gill_x in [80, 84, 88]:
        draw.line([gill_x, 28, gill_x, 36], fill=darken(top, 0.5), width=1)

# ============================================================================
# DOLPHIN - Intelligent marine mammal
# ============================================================================
def draw_dolphin(img, colors):
    draw = ImageDraw.Draw(img)
    top = hex_to_rgb(colors['top'])
    belly = hex_to_rgb(colors['belly'])

    top_d = darken(top, 0.2)
    belly_l = lighten(belly, 0.2)

    # Smooth streamlined body
    for y in range(16, 48):
        for x in range(30, 108):
            progress = (x - 30) / 78

            # Dolphin curve (slight arch)
            curve = 2 if 0.3 < progress < 0.7 else 0
            center_y = 32 - curve

            # Width profile
            if progress < 0.15:
                width = 16 * (progress / 0.15)
            elif progress < 0.5:
                width = 16
            else:
                width = 16 * (1 - (progress - 0.5) / 0.5)

            dy = abs(y - center_y)
            if dy < width:
                # Counter-shading (dark top, light belly)
                if y < center_y:
                    t = (center_y - y) / width
                    color = blend(belly, top, t)
                else:
                    t = (y - center_y) / width
                    color = blend(belly, belly_l, t * 0.3)

                # Smooth skin texture
                if (x * 11 + y * 7) % 31 < 2:
                    color = lighten(color, 0.05)

                img.putpixel((x, y), color)

    # Dorsal fin (curved)
    for y in range(8, 18):
        for x in range(64, 76):
            dy = 18 - y
            dx = abs(x - 70)
            if dy > dx * 0.8:
                img.putpixel((x, y), top if dy > dx else top_d)

    # Pectoral fins (flippers)
    for y in range(26, 40):
        for x in range(60, 74):
            dy = abs(y - 33)
            dx = x - 60
            if dy < 10 - dx * 0.7:
                img.putpixel((x, y), blend(top, belly, 0.6))

    # Rostrum (beak)
    for y in range(28, 36):
        for x in range(105, 118):
            dy = abs(y - 32)
            dx = x - 105
            width = 4 - dx * 0.3
            if dy < width:
                color = top_d if y < 32 else belly
                img.putpixel((x, y), color)

    # Tail flukes (horizontal)
    for y in range(28, 36):
        for x in range(12, 32):
            dist_top = abs(y - 28) + (32 - x) * 0.5
            dist_bottom = abs(y - 36) + (32 - x) * 0.5
            if dist_top < 8 or dist_bottom < 8:
                img.putpixel((x, y), top_d if x % 3 else top)

    # Eye (intelligent)
    eye_x, eye_y = 100, 28
    draw.ellipse([eye_x-4, eye_y-4, eye_x+4, eye_y+4], fill=(255, 255, 255))
    draw.ellipse([eye_x-3, eye_y-3, eye_x+3, eye_y+3], fill=(60, 60, 60))
    draw.ellipse([eye_x-2, eye_y-2, eye_x+2, eye_y+2], fill=(0, 0, 0))
    draw.ellipse([eye_x-1, eye_y-2, eye_x+1, eye_y], fill=(255, 255, 255))

    # Smile line
    draw.line([108, 32, 114, 34], fill=darken(top, 0.3), width=1)

# ============================================================================
# OARFISH - Long ribbon-like legendary fish
# ============================================================================
def draw_oarfish(img, colors):
    draw = ImageDraw.Draw(img)
    body = hex_to_rgb(colors['body'])
    stripe = hex_to_rgb(colors['stripe'])
    fins = hex_to_rgb(colors['fins'])

    body_l = lighten(body, 0.2)
    body_d = darken(body, 0.2)

    # Very long, ribbon-like body (128x72 canvas)
    for x in range(8, 120):
        # Gentle wave
        wave = 36 + int(6 * ((x / 15) % 1 - 0.5) * 2)

        # Thickness (very thin, ribbon-like)
        progress = (x - 8) / 112
        if progress < 0.1:
            thickness = int(10 * progress / 0.1)
        else:
            thickness = 10

        for dy in range(-thickness, thickness + 1):
            y = wave + dy
            if 0 <= y < 72:
                # Silver with red stripe along lateral line
                if abs(dy) < 2:
                    color = stripe
                else:
                    t = abs(dy) / thickness
                    color = blend(body_l, body_d, t)

                # Iridescent spots
                if (x * 5 + y * 7) % 19 < 3:
                    color = lighten(color, 0.3)

                img.putpixel((x, y), color)

    # Spiny dorsal fin (red crest along entire back)
    for x in range(20, 115):
        wave = 36 + int(6 * ((x / 15) % 1 - 0.5) * 2)
        # Spines every 8 pixels
        if x % 8 < 3:
            for dy in range(-18, -10):
                y = wave + dy
                if 0 <= y < 72:
                    img.putpixel((x, y), stripe)

    # Crown-like head ornament
    for x in range(108, 120):
        for dy in range(-16, -6):
            y = 36 + dy
            if 0 <= y < 72 and (x % 4 < 2):
                img.putpixel((x, y), stripe)

    # Large eye
    eye_x, eye_y = 114, 32
    draw.ellipse([eye_x-5, eye_y-5, eye_x+5, eye_y+5], fill=(255, 255, 255))
    draw.ellipse([eye_x-3, eye_y-3, eye_x+3, eye_y+3], fill=(50, 50, 150))
    draw.ellipse([eye_x-2, eye_y-2, eye_x+2, eye_y+2], fill=(0, 0, 0))
    draw.ellipse([eye_x-1, eye_y-2, eye_x+1, eye_y], fill=(255, 255, 255))

# ============================================================================
# ANGLERFISH - Deep sea with bioluminescent lure
# ============================================================================
def draw_anglerfish(img, colors):
    draw = ImageDraw.Draw(img)
    body = hex_to_rgb(colors['body'])
    lure = hex_to_rgb(colors['lure'])

    body_d = darken(body, 0.4)
    body_l = lighten(body, 0.1)

    # Large round body (128x64)
    for y in range(20, 52):
        for x in range(50, 95):
            dx = (x - 72) / 22
            dy = (y - 36) / 16
            if dx*dx + dy*dy < 1:
                # Mottled dark texture
                if (x * 7 + y * 11) % 13 < 4:
                    color = body_d
                elif (x * 3 + y * 5) % 17 < 5:
                    color = body
                else:
                    color = body_l

                img.putpixel((x, y), color)

    # Huge mouth with fangs
    for y in range(32, 44):
        for x in range(88, 102):
            # Mouth cavity (dark)
            dx = x - 95
            dy = abs(y - 38)
            if dy < 8 - dx * 0.5:
                img.putpixel((x, y), (20, 10, 10))

    # Fangs (irregular)
    fang_positions = [(92, 32), (96, 31), (90, 34), (98, 33),
                      (92, 44), (96, 45), (90, 42), (98, 43)]
    for fx, fy in fang_positions:
        for dy in range(4):
            if 0 <= fy + dy < 64:
                img.putpixel((fx, fy + dy), (240, 240, 230))

    # Fishing rod (illicium) from head
    rod_points = [(68, 16), (66, 12), (64, 8), (62, 6)]
    for i in range(len(rod_points) - 1):
        draw.line([rod_points[i], rod_points[i+1]], fill=body_d, width=2)

    # Bioluminescent lure (esca)
    lure_x, lure_y = 62, 6
    for radius in range(6, 0, -1):
        brightness = (6 - radius) / 6
        glow_color = blend((0, 0, 0), lure, brightness)
        draw.ellipse([lure_x - radius, lure_y - radius,
                     lure_x + radius, lure_y + radius],
                     fill=glow_color)

    # Small beady eye
    eye_x, eye_y = 78, 28
    draw.ellipse([eye_x-3, eye_y-3, eye_x+3, eye_y+3], fill=(255, 255, 255))
    draw.ellipse([eye_x-2, eye_y-2, eye_x+2, eye_y+2], fill=(0, 0, 0))

    # Small fins
    for y in range(30, 38):
        for x in range(48, 54):
            if abs(y - 34) < 6 - (x - 48):
                img.putpixel((x, y), body_d)

# ============================================================================
# Main generation
# ============================================================================
def main():
    species_data = [
        ('guppy', 128, 64, {
            'top': '#4169E1',
            'belly': '#87CEEB',
            'fin': '#FF6347'
        }),
        ('gold', 128, 64, {
            'body': '#FFA500',
            'fins': '#FFD700'
        }),
        ('squid', 128, 64, {
            'body': '#9370DB',
            'tentacles': '#BA55D3'
        }),
        ('koi', 128, 64, {
            'base': '#FFFFFF',
            'orange': '#FF6347',
            'black': '#1a1a1a'
        }),
        ('angel', 128, 64, {
            'body': '#FFD700',
            'stripes': '#1a1a1a',
            'fins': '#FFA500'
        }),
        ('discus', 128, 64, {
            'body': '#FF4500',
            'pattern': '#8B4513',
            'fins': '#FF6347'
        }),
        ('eel', 128, 64, {
            'body': '#2F4F4F',
            'belly': '#8FBC8F'
        }),
        ('turtle', 128, 64, {
            'shell': '#8B4513',
            'skin': '#90EE90',
            'pattern': '#2F4F2F'
        }),
        ('shark', 128, 64, {
            'top': '#708090',
            'belly': '#F5F5F5'
        }),
        ('dolphin', 128, 64, {
            'top': '#4682B4',
            'belly': '#E0E0E0'
        }),
        ('oarfish', 128, 72, {
            'body': '#C0C0C0',
            'stripe': '#DC143C',
            'fins': '#FF6347'
        }),
        ('angler', 128, 64, {
            'body': '#2F2F2F',
            'lure': '#00FFFF'
        })
    ]

    import os
    os.makedirs('assets/fish', exist_ok=True)

    # Map file names to function names
    func_name_map = {
        'gold': 'goldfish',
        'angel': 'angelfish',
        'angler': 'anglerfish'
    }

    for name, width, height, colors in species_data:
        img = Image.new('RGBA', (width, height), (0, 0, 0, 0))

        # Call the appropriate drawing function
        func_name = func_name_map.get(name, name)
        draw_func = globals()[f'draw_{func_name}']
        draw_func(img, colors)

        path = f'assets/fish/{name}.png'
        img.save(path)
        print(f'Created {path} ({width}x{height})')

    print(f'\nGenerated {len(species_data)} enhanced fish sprites!')

if __name__ == '__main__':
    main()
