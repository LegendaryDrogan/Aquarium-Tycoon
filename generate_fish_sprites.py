#!/usr/bin/env python3
"""
Generate pixel art fish sprites for Aquarium Tycoon
"""
from PIL import Image, ImageDraw
import os

# Base colors for each species (matching the game's speciesStyle)
FISH_SPRITES = {
    'guppy': {
        'colors': {'top': '#64c8ff', 'belly': '#e6f6ff', 'fin': '#f6a9ff'},
        'size': (64, 32)  # Larger for more detail
    },
    'gold': {
        'colors': {'top': '#ffae3a', 'belly': '#fff1c9', 'fin': '#ffd36a'},
        'size': (72, 40)
    },
    'squid': {
        'colors': {'top': '#c0d2ff', 'belly': '#eaf0ff', 'fin': '#d7e0ff'},
        'size': (72, 48)
    },
    'koi': {
        'colors': {'top': '#ff7b6a', 'belly': '#ffe8d8', 'fin': '#ff9980'},
        'size': (80, 40)
    },
    'angel': {
        'colors': {'top': '#ffeb3b', 'belly': '#fffae6', 'fin': '#fff176'},
        'size': (64, 72)
    },
    'discus': {
        'colors': {'top': '#ff5252', 'belly': '#ffd4d4', 'fin': '#ff7b7b'},
        'size': (72, 72)
    },
    'eel': {
        'colors': {'top': '#4a7c59', 'belly': '#a8d5ba', 'fin': '#6b9b7a'},
        'size': (112, 32)
    },
    'turtle': {
        'colors': {'top': '#5d7f3f', 'belly': '#c9dfb0', 'fin': '#8fae6f'},
        'size': (80, 56)
    },
    'shark': {
        'colors': {'top': '#607d8b', 'belly': '#cfd8dc', 'fin': '#90a4ae'},
        'size': (96, 48)
    },
    'dolphin': {
        'colors': {'top': '#42a5f5', 'belly': '#e3f2fd', 'fin': '#64b5f6'},
        'size': (96, 52)
    },
    'oarfish': {
        'colors': {'top': '#e040fb', 'belly': '#f3e5f5', 'fin': '#ea80fc'},
        'size': (128, 36)
    },
    'angler': {
        'colors': {'top': '#1a1a2e', 'belly': '#3d405b', 'fin': '#2e2e4a'},
        'size': (84, 64)
    }
}

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def draw_guppy(img, colors):
    """Draw detailed pixel art guppy"""
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])
    # Shading colors
    top_dark = tuple(max(0, c - 30) for c in top)
    belly_light = tuple(min(255, c + 20) for c in belly)
    fin_light = tuple(min(255, c + 30) for c in fin)

    # Large fancy tail fin
    for y in range(6, 26):
        for x in range(2, 18):
            dist = abs(y - 16) + (x - 2) * 0.6
            if dist < 14:
                # Add gradient to fin
                if (x - 2) % 3 == 0:
                    img.putpixel((x, y), fin_light)
                else:
                    img.putpixel((x, y), fin)

    # Body with shading
    for y in range(10, 22):
        for x in range(18, 52):
            dy = abs(y - 16)
            if dy < 6:
                if y > 16:
                    # Belly
                    if x < 30:
                        img.putpixel((x, y), belly_light)
                    else:
                        img.putpixel((x, y), belly)
                else:
                    # Top
                    if x > 35:
                        img.putpixel((x, y), top_dark)
                    else:
                        img.putpixel((x, y), top)

    # Head
    for y in range(12, 20):
        for x in range(52, 60):
            if abs(y - 16) < 4:
                img.putpixel((x, y), top if y <= 16 else belly)

    # Dorsal fin with detail
    for y in range(4, 12):
        for x in range(28, 42):
            if (x - 28) + (y - 4) < 10 and (42 - x) + (y - 4) < 8:
                if (x + y) % 2 == 0:
                    img.putpixel((x, y), fin_light)
                else:
                    img.putpixel((x, y), fin)

    # Ventral fin
    for y in range(20, 26):
        for x in range(32, 42):
            if (x - 32) + (26 - y) < 8:
                img.putpixel((x, y), fin)

    # Scale pattern
    for y in range(12, 20, 2):
        for x in range(24, 48, 3):
            if abs(y - 16) < 5:
                img.putpixel((x, y), belly_light if y > 16 else top_dark)

    # Eye with white highlight
    for dy in range(3):
        for dx in range(3):
            img.putpixel((54 + dx, 14 + dy), (0, 0, 0))
    img.putpixel((55, 14), (255, 255, 255))
    img.putpixel((56, 15), (255, 255, 255))

def draw_goldfish(img, colors):
    """Draw pixel art goldfish"""
    draw = ImageDraw.Draw(img)
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])

    # Fancy tail
    for y in range(6, 22):
        for x in range(2, 14):
            if (x - 2) + abs(y - 14) < 12:
                img.putpixel((x, y), fin)

    # Rounded body
    for y in range(4, 24):
        for x in range(14, 42):
            dy = abs(y - 14)
            if dy < 10:
                color = belly if y > 14 else top
                img.putpixel((x, y), color)

    # Head
    for y in range(8, 20):
        for x in range(42, 48):
            if abs(y - 14) < 6:
                img.putpixel((x, y), top if y <= 14 else belly)

    # Dorsal fin
    for y in range(0, 6):
        for x in range(22, 32):
            if (x - 22) + y < 8 and (32 - x) + y < 6:
                img.putpixel((x, y), fin)

    # Eye
    for dy in range(2):
        for dx in range(2):
            img.putpixel((44 + dx, 12 + dy), (0, 0, 0))

def draw_shark(img, colors):
    """Draw pixel art shark"""
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])

    # Tail fin
    for y in range(10, 22):
        for x in range(2, 12):
            if abs(y - 16) + (x - 2) < 10:
                img.putpixel((x, y), fin)

    # Streamlined body
    for y in range(6, 26):
        for x in range(12, 60):
            dy = abs(y - 16)
            if dy < 10:
                color = belly if y > 16 else top
                img.putpixel((x, y), color)

    # Pointed head
    for y in range(10, 22):
        for x in range(60, 68):
            if abs(y - 16) < 6 - (x - 60) // 2:
                img.putpixel((x, y), top if y <= 16 else belly)

    # Iconic dorsal fin
    for y in range(0, 8):
        for x in range(28, 38):
            if (x - 28) + y < 8 and (38 - x) + y < 6:
                img.putpixel((x, y), fin)

    # Pectoral fin
    for y in range(18, 26):
        for x in range(32, 42):
            if (y - 18) + (x - 32) < 8:
                img.putpixel((x, y), fin)

    # Eye
    for dy in range(2):
        for dx in range(2):
            img.putpixel((62 + dx, 14 + dy), (0, 0, 0))

def draw_koi(img, colors):
    """Draw pixel art koi"""
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])

    # Flowing tail
    for y in range(6, 22):
        for x in range(2, 16):
            if abs(y - 14) + (x - 2) * 0.8 < 12:
                img.putpixel((x, y), fin)

    # Elegant body
    for y in range(8, 20):
        for x in range(16, 50):
            dy = abs(y - 14)
            if dy < 6:
                color = belly if y > 14 else top
                img.putpixel((x, y), color)

    # Head
    for y in range(10, 18):
        for x in range(50, 56):
            if abs(y - 14) < 4:
                img.putpixel((x, y), top if y <= 14 else belly)

    # Barbels (whiskers)
    img.putpixel((56, 16), top)
    img.putpixel((57, 17), top)

    # Dorsal fin
    for y in range(4, 10):
        for x in range(28, 38):
            if (x - 28) + (y - 4) < 8 and (38 - x) + (y - 4) < 6:
                img.putpixel((x, y), fin)

    # Eye
    for dy in range(2):
        for dx in range(2):
            img.putpixel((52 + dx, 12 + dy), (0, 0, 0))

def draw_simple_fish(img, colors, has_tall_fins=False):
    """Draw a generic pixel art fish"""
    width, height = img.size
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])

    mid_y = height // 2
    tail_end = width // 6
    body_start = tail_end
    body_end = width - width // 6
    head_end = width - 4

    # Tail
    for y in range(height):
        for x in range(tail_end):
            if abs(y - mid_y) < (tail_end - x) * 1.2:
                img.putpixel((x, y), fin)

    # Body
    body_height = height // 3 if not has_tall_fins else height // 2
    for y in range(mid_y - body_height, mid_y + body_height):
        for x in range(body_start, body_end):
            color = belly if y > mid_y else top
            img.putpixel((x, y), color)

    # Head
    for y in range(mid_y - body_height + 2, mid_y + body_height - 2):
        for x in range(body_end, head_end):
            if abs(y - mid_y) < body_height - (x - body_end):
                img.putpixel((x, y), top if y <= mid_y else belly)

    # Dorsal fin
    fin_start = width // 3
    fin_end = width // 2
    fin_height = 6 if not has_tall_fins else height // 3
    for y in range(mid_y - body_height - fin_height, mid_y - body_height):
        for x in range(fin_start, fin_end):
            if (x - fin_start) + (mid_y - body_height - y) < fin_height:
                img.putpixel((x, y), fin)

    # Eye
    eye_x = head_end - 6
    eye_y = mid_y - 2
    for dy in range(2):
        for dx in range(2):
            img.putpixel((eye_x + dx, eye_y + dy), (0, 0, 0))

def draw_eel(img, colors):
    """Draw pixel art eel"""
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])

    # Long serpentine body
    mid_y = 10
    for x in range(80):
        wave = int(4 * abs(((x / 10.0) % 2) - 1))
        y_center = mid_y + wave
        for dy in range(-3, 4):
            y = y_center + dy
            if 0 <= y < 20:
                color = belly if abs(dy) > 1 else top
                img.putpixel((x, y), color)

    # Head fin
    for y in range(6, 14):
        for x in range(70, 76):
            if abs(y - 10) < 4:
                img.putpixel((x, y), fin)

    # Eye
    img.putpixel((74, 9), (0, 0, 0))
    img.putpixel((75, 9), (0, 0, 0))

def draw_turtle(img, colors):
    """Draw pixel art turtle"""
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])
    dark = tuple(max(0, c - 40) for c in hex_to_rgb(colors['top']))

    # Shell (oval)
    for y in range(8, 32):
        for x in range(12, 44):
            dy = (y - 20) / 12.0
            dx = (x - 28) / 16.0
            if dx * dx + dy * dy < 1:
                img.putpixel((x, y), top)

    # Shell pattern
    for y in range(12, 28, 4):
        for x in range(16, 40, 6):
            img.putpixel((x, y), dark)
            img.putpixel((x + 1, y), dark)

    # Head
    for y in range(16, 24):
        for x in range(44, 52):
            if abs(y - 20) < 4:
                img.putpixel((x, y), fin)

    # Flippers
    for y in range(14, 20):
        for x in range(8, 14):
            if y - 14 + (x - 8) < 6:
                img.putpixel((x, y), fin)
    for y in range(22, 28):
        for x in range(8, 14):
            if (28 - y) + (x - 8) < 6:
                img.putpixel((x, y), fin)

    # Eye
    img.putpixel((48, 18), (0, 0, 0))
    img.putpixel((49, 18), (0, 0, 0))

def draw_dolphin(img, colors):
    """Draw pixel art dolphin"""
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])

    # Streamlined body
    for y in range(8, 28):
        for x in range(10, 58):
            dy = abs(y - 18)
            if dy < 10:
                color = belly if y > 18 else top
                img.putpixel((x, y), color)

    # Curved tail
    for y in range(14, 22):
        for x in range(2, 12):
            if abs(y - 18) + (x - 2) < 8:
                img.putpixel((x, y), fin)

    # Snout
    for y in range(14, 22):
        for x in range(58, 64):
            if abs(y - 18) < 4 - (x - 58) // 2:
                img.putpixel((x, y), top if y <= 18 else belly)

    # Dorsal fin
    for y in range(2, 10):
        for x in range(30, 40):
            if (x - 30) + (y - 2) < 8 and (40 - x) + (y - 2) < 6:
                img.putpixel((x, y), fin)

    # Eye
    for dy in range(2):
        for dx in range(2):
            img.putpixel((56 + dx, 16 + dy), (0, 0, 0))

def draw_oarfish(img, colors):
    """Draw pixel art oarfish"""
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])

    # Very long ribbon-like body
    mid_y = 12
    for x in range(96):
        # Slight wave
        wave = int(2 * abs(((x / 15.0) % 2) - 1))
        y_center = mid_y + wave
        thickness = 4 if x < 80 else max(1, 4 - (x - 80) // 4)
        for dy in range(-thickness, thickness + 1):
            y = y_center + dy
            if 0 <= y < 24:
                color = belly if abs(dy) > 1 else top
                img.putpixel((x, y), color)

    # Crown-like dorsal fin
    for x in range(10, 86, 8):
        for y in range(mid_y - 8, mid_y - 4):
            if (y - (mid_y - 8)) < 3:
                img.putpixel((x, y), fin)
                img.putpixel((x + 1, y), fin)

    # Eye
    img.putpixel((88, 11), (0, 0, 0))
    img.putpixel((89, 11), (0, 0, 0))

def draw_anglerfish(img, colors):
    """Draw pixel art anglerfish"""
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])

    # Large round body
    center_x, center_y = 30, 28
    for y in range(12, 40):
        for x in range(16, 48):
            dy = (y - center_y) / 14.0
            dx = (x - center_x) / 16.0
            if dx * dx + dy * dy < 1:
                color = belly if y > center_y else top
                img.putpixel((x, y), color)

    # Large mouth
    for x in range(44, 54):
        y = 30 + (x - 44) // 3
        if y < 36:
            img.putpixel((x, y), (20, 20, 20))

    # Teeth
    for x in range(46, 52, 2):
        img.putpixel((x, 29), (255, 255, 255))
        img.putpixel((x, 35), (255, 255, 255))

    # Lure (bioluminescent)
    for y in range(2, 14):
        x = 32 + (14 - y) // 4
        img.putpixel((x, y), fin)
    # Glowing orb
    img.putpixel((32, 1), (255, 255, 100))
    img.putpixel((33, 1), (255, 255, 100))
    img.putpixel((32, 2), (255, 255, 100))
    img.putpixel((33, 2), (255, 255, 100))

    # Tiny eye
    img.putpixel((40, 22), (255, 255, 255))
    img.putpixel((41, 22), (255, 255, 255))

def draw_angelfish(img, colors):
    """Draw pixel art angelfish"""
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])

    # Tall triangular body
    center_x, center_y = 24, 26
    for y in range(4, 48):
        for x in range(12, 40):
            dy = abs(y - center_y)
            dx = abs(x - center_x)
            # Diamond shape
            if dy + dx * 1.5 < 26:
                color = belly if x > center_x else top
                img.putpixel((x, y), color)

    # Tall dorsal fin
    for y in range(0, 12):
        for x in range(18, 32):
            if abs(x - 24) + y < 10:
                img.putpixel((x, y), fin)

    # Tall ventral fin
    for y in range(40, 52):
        for x in range(18, 32):
            if abs(x - 24) + (52 - y) < 10:
                img.putpixel((x, y), fin)

    # Eye
    for dy in range(2):
        for dx in range(2):
            img.putpixel((32 + dx, 24 + dy), (0, 0, 0))

def draw_discus(img, colors):
    """Draw pixel art discus"""
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])

    # Round flat body
    center_x, center_y = 26, 26
    for y in range(6, 46):
        for x in range(10, 42):
            dy = (y - center_y) / 20.0
            dx = (x - center_x) / 16.0
            if dx * dx + dy * dy < 1:
                # Vertical striped pattern
                if x % 4 < 2:
                    color = top
                else:
                    color = belly
                img.putpixel((x, y), color)

    # Fins
    for y in range(4, 48):
        x = 6
        if abs(y - center_y) < 22:
            img.putpixel((x, y), fin)
            img.putpixel((x + 1, y), fin)

    for y in range(4, 48):
        x = 44
        if abs(y - center_y) < 22:
            img.putpixel((x, y), fin)
            img.putpixel((x + 1, y), fin)

    # Eye
    for dy in range(2):
        for dx in range(2):
            img.putpixel((36 + dx, 24 + dy), (0, 0, 0))

def draw_squid(img, colors):
    """Draw pixel art squid"""
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])

    # Mantle (body)
    for y in range(8, 24):
        for x in range(16, 46):
            dy = abs(y - 16)
            if dy < 8:
                color = belly if y > 16 else top
                img.putpixel((x, y), color)

    # Head/eyes
    for y in range(12, 20):
        for x in range(46, 52):
            if abs(y - 16) < 4:
                img.putpixel((x, y), top)

    # Tentacles (8 of them)
    tentacle_positions = [
        (10, 18), (8, 20), (6, 22), (4, 24),
        (10, 14), (8, 12), (6, 10), (4, 8)
    ]
    for start_x, start_y in tentacle_positions:
        for i in range(6):
            x = start_x - i
            y = start_y + (i // 2 if start_y > 16 else -i // 2)
            if 0 <= x < 56 and 0 <= y < 32:
                img.putpixel((x, y), fin)

    # Eyes (large)
    for dy in range(3):
        for dx in range(3):
            if dx + dy > 0:
                img.putpixel((48 + dx, 14 + dy), (0, 0, 0))

# Generate all fish sprites
def generate_all_sprites():
    output_dir = "C:/Users/chase/Desktop/WebGame/assets/fish"
    os.makedirs(output_dir, exist_ok=True)

    fish_drawers = {
        'guppy': draw_guppy,
        'gold': draw_goldfish,
        'shark': draw_shark,
        'koi': draw_koi,
        'eel': draw_eel,
        'turtle': draw_turtle,
        'dolphin': draw_dolphin,
        'oarfish': draw_oarfish,
        'angler': draw_anglerfish,
        'angel': draw_angelfish,
        'discus': draw_discus,
        'squid': draw_squid,
    }

    for fish_id, fish_data in FISH_SPRITES.items():
        width, height = fish_data['size']
        img = Image.new('RGBA', (width, height), (0, 0, 0, 0))

        drawer = fish_drawers.get(fish_id)
        if drawer:
            drawer(img, fish_data['colors'])

        # Save the sprite
        output_path = os.path.join(output_dir, f"{fish_id}.png")
        img.save(output_path)
        print(f"Generated {fish_id}.png ({width}x{height})")

if __name__ == "__main__":
    generate_all_sprites()
    print("\nAll fish sprites generated successfully!")
