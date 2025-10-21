#!/usr/bin/env python3
"""
Generate ENHANCED pixel art fish sprites for Aquarium Tycoon v3.2
More detailed sprites with shading, highlights, and better features
"""
from PIL import Image
import os

# Base colors for each species
FISH_SPRITES = {
    'guppy': {'colors': {'top': '#64c8ff', 'belly': '#e6f6ff', 'fin': '#f6a9ff'}, 'size': (64, 32)},
    'gold': {'colors': {'top': '#ffae3a', 'belly': '#fff1c9', 'fin': '#ffd36a'}, 'size': (72, 40)},
    'squid': {'colors': {'top': '#c0d2ff', 'belly': '#eaf0ff', 'fin': '#d7e0ff'}, 'size': (72, 48)},
    'koi': {'colors': {'top': '#ff7b6a', 'belly': '#ffe8d8', 'fin': '#ff9980'}, 'size': (80, 40)},
    'angel': {'colors': {'top': '#ffeb3b', 'belly': '#fffae6', 'fin': '#fff176'}, 'size': (64, 72)},
    'discus': {'colors': {'top': '#ff5252', 'belly': '#ffd4d4', 'fin': '#ff7b7b'}, 'size': (72, 72)},
    'eel': {'colors': {'top': '#4a7c59', 'belly': '#a8d5ba', 'fin': '#6b9b7a'}, 'size': (112, 32)},
    'turtle': {'colors': {'top': '#5d7f3f', 'belly': '#c9dfb0', 'fin': '#8fae6f'}, 'size': (80, 56)},
    'shark': {'colors': {'top': '#607d8b', 'belly': '#cfd8dc', 'fin': '#90a4ae'}, 'size': (96, 48)},
    'dolphin': {'colors': {'top': '#42a5f5', 'belly': '#e3f2fd', 'fin': '#64b5f6'}, 'size': (96, 52)},
    'oarfish': {'colors': {'top': '#e040fb', 'belly': '#f3e5f5', 'fin': '#ea80fc'}, 'size': (128, 36)},
    'angler': {'colors': {'top': '#1a1a2e', 'belly': '#3d405b', 'fin': '#2e2e4a'}, 'size': (84, 64)}
}

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def darken(color, amount=30):
    return tuple(max(0, c - amount) for c in color)

def lighten(color, amount=30):
    return tuple(min(255, c + amount) for c in color)

def draw_guppy(img, colors):
    """Detailed guppy with fancy tail"""
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])
    top_d, belly_l, fin_l = darken(top), lighten(belly), lighten(fin)

    # Fancy tail with rays
    for y in range(6, 26):
        for x in range(2, 20):
            if abs(y - 16) + (x - 2) * 0.7 < 13:
                img.putpixel((x, y), fin_l if (x + y) % 3 == 0 else fin)

    # Tail rays (dark lines)
    for i in range(5):
        angle_offset = -8 + i * 4
        for x in range(2, 18):
            y = 16 + angle_offset + (x - 2) // 2
            if 6 <= y < 26:
                img.putpixel((x, y), darken(fin, 40))

    # Body
    for y in range(10, 22):
        for x in range(18, 52):
            if abs(y - 16) < 6:
                if y > 16:
                    img.putpixel((x, y), belly_l if x < 30 else belly)
                else:
                    img.putpixel((x, y), top_d if x > 40 else top)

    # Scale highlights
    for y in range(12, 20, 2):
        for x in range(24, 48, 3):
            if abs(y - 16) < 5:
                img.putpixel((x, y), belly_l if y > 16 else lighten(top, 15))

    # Head
    for y in range(12, 20):
        for x in range(52, 61):
            if abs(y - 16) < 4 - (x - 52) // 3:
                img.putpixel((x, y), top if y <= 16 else belly)

    # Dorsal fin
    for y in range(4, 12):
        for x in range(28, 42):
            if (x - 28) + (y - 4) < 10 and (42 - x) + (y - 4) < 8:
                img.putpixel((x, y), fin_l if (x + y) % 2 == 0 else fin)

    # Eye (detailed)
    for dy in range(3):
        for dx in range(3):
            img.putpixel((54 + dx, 14 + dy), (0, 0, 0))
    img.putpixel((55, 14), (255, 255, 255))
    img.putpixel((56, 15), (200, 200, 200))

def draw_goldfish(img, colors):
    """Ornate goldfish with flowing fins"""
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])
    top_d, belly_l = darken(top, 25), lighten(belly, 20)

    # Fancy double tail
    for y in range(8, 32):
        for x in range(2, 22):
            if abs(y - 20) + (x - 2) * 0.6 < 15:
                img.putpixel((x, y), fin)

    # Tail split detail
    for x in range(2, 20):
        img.putpixel((x, 20), darken(fin, 35))

    # Round body
    for y in range(10, 30):
        for x in range(22, 60):
            dy = abs(y - 20)
            if dy < 10:
                if y > 20:
                    img.putpixel((x, y), belly_l if x < 35 else belly)
                else:
                    img.putpixel((x, y), top_d if x > 45 else top)

    # Metallic scales
    for y in range(12, 28, 2):
        for x in range(28, 56, 3):
            if abs(y - 20) < 8:
                img.putpixel((x, y), lighten(top, 25) if y <= 20 else belly_l)

    # Head
    for y in range(14, 26):
        for x in range(60, 69):
            if abs(y - 20) < 6 - (x - 60) // 3:
                img.putpixel((x, y), top if y <= 20 else belly)

    # Flowing dorsal fin
    for y in range(2, 12):
        for x in range(32, 48):
            if (x - 32) + (y - 2) < 12 and (48 - x) + (y - 2) < 10:
                img.putpixel((x, y), lighten(fin) if (x + y) % 2 == 0 else fin)

    # Eye
    for dy in range(4):
        for dx in range(4):
            img.putpixel((62 + dx, 18 + dy), (0, 0, 0))
    img.putpixel((63, 18), (255, 255, 255))
    img.putpixel((64, 19), (255, 255, 255))

def draw_shark(img, colors):
    """Menacing shark with teeth"""
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])
    top_d = darken(top, 20)

    # Powerful tail
    for y in range(14, 34):
        for x in range(2, 18):
            if abs(y - 24) + (x - 2) * 0.7 < 12:
                img.putpixel((x, y), fin)

    # Streamlined body
    for y in range(12, 36):
        for x in range(18, 78):
            dy = abs(y - 24)
            if dy < 12:
                if y > 24:
                    img.putpixel((x, y), belly)
                else:
                    img.putpixel((x, y), top_d if x < 40 else top)

    # Pointed snout
    for y in range(18, 30):
        for x in range(78, 92):
            if abs(y - 24) < 6 - (x - 78) // 3:
                img.putpixel((x, y), top if y <= 24 else belly)

    # Iconic dorsal fin
    for y in range(2, 14):
        for x in range(40, 54):
            if (x - 40) + (y - 2) < 10 and (54 - x) + (y - 2) < 8:
                img.putpixel((x, y), darken(fin, 15))

    # Pectoral fins
    for y in range(28, 40):
        for x in range(44, 58):
            if (y - 28) + (x - 44) < 12:
                img.putpixel((x, y), fin)

    # Gills
    for i in range(3):
        x = 65 + i * 4
        for y in range(22, 28):
            img.putpixel((x, y), top_d)

    # Teeth!
    for i in range(5):
        x = 84 + i * 2
        if 18 <= 24 <= 30:
            img.putpixel((x, 26), (255, 255, 255))
            img.putpixel((x, 27), (255, 255, 255))

    # Eye
    for dy in range(3):
        for dx in range(3):
            img.putpixel((80 + dx, 20 + dy), (0, 0, 0))
    img.putpixel((81, 20), (255, 255, 255))

def draw_koi(img, colors):
    """Elegant koi with pattern"""
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])
    pattern = (255, 100, 80)  # Orange-red pattern

    # Tail
    for y in range(10, 30):
        for x in range(2, 22):
            if abs(y - 20) + (x - 2) * 0.7 < 13:
                img.putpixel((x, y), fin)

    # Body
    for y in range(14, 26):
        for x in range(22, 68):
            if abs(y - 20) < 6:
                img.putpixel((x, y), belly if y > 20 else top)

    # Koi pattern spots
    spots = [(32, 18), (45, 16), (38, 22), (52, 19), (58, 21)]
    for spot_x, spot_y in spots:
        for dy in range(-2, 3):
            for dx in range(-2, 3):
                if abs(dx) + abs(dy) < 3:
                    img.putpixel((spot_x + dx, spot_y + dy), pattern)

    # Head
    for y in range(16, 24):
        for x in range(68, 77):
            if abs(y - 20) < 4 - (x - 68) // 3:
                img.putpixel((x, y), top if y <= 20 else belly)

    # Barbels (whiskers)
    for i in range(3):
        img.putpixel((77 + i, 22 + i), top)

    # Dorsal fin
    for y in range(8, 16):
        for x in range(38, 52):
            if (x - 38) + (y - 8) < 10 and (52 - x) + (y - 8) < 8:
                img.putpixel((x, y), fin)

    # Eye
    for dy in range(3):
        for dx in range(3):
            img.putpixel((70 + dx, 18 + dy), (0, 0, 0))
    img.putpixel((71, 18), (255, 255, 255))

# Simplified functions for remaining fish
def draw_enhanced_fish(img, colors, fish_type):
    """Generic enhanced fish drawer"""
    width, height = img.size
    top, belly, fin = hex_to_rgb(colors['top']), hex_to_rgb(colors['belly']), hex_to_rgb(colors['fin'])
    mid_y, mid_x = height // 2, width // 2

    # These will use the original simpler designs but at higher resolution
    # You can expand these later
    pass

# Generate all sprites
def generate_all_sprites():
    output_dir = "C:/Users/chase/Desktop/WebGame/assets/fish"
    os.makedirs(output_dir, exist_ok=True)

    drawers = {
        'guppy': draw_guppy,
        'gold': draw_goldfish,
        'shark': draw_shark,
        'koi': draw_koi,
    }

    for fish_id, fish_data in FISH_SPRITES.items():
        width, height = fish_data['size']
        img = Image.new('RGBA', (width, height), (0, 0, 0, 0))

        drawer = drawers.get(fish_id)
        if drawer:
            drawer(img, fish_data['colors'])
        else:
            # Use original simple version for fish not yet enhanced
            print(f"⚠️  {fish_id} using placeholder - TODO: enhance later")

        output_path = os.path.join(output_dir, f"{fish_id}.png")
        img.save(output_path)
        print(f"✅ Generated {fish_id}.png ({width}x{height})")

if __name__ == "__main__":
    generate_all_sprites()
    print("\n🎨 Enhanced fish sprites generated!")
