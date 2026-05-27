"""
为台风岗位指挥课程生成酷炫场景风占位图
暗色科技风 + 电影质感，每张图模拟对应的场景氛围
"""
import json
import os
from PIL import Image, ImageDraw, ImageFont
import math
import random

os.makedirs('public/knowledge-images', exist_ok=True)

with open('scripts/typhoon_command_images.json', 'r', encoding='utf-8') as f:
    images = json.load(f)

W, H = 1280, 900

FONT_BOLD = "C:/Windows/Fonts/msyhbd.ttf"
FONT_REG = "C:/Windows/Fonts/msyh.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def wrap_text(draw, text, font, max_width):
    lines = []
    current = ''
    for ch in text:
        test = current + ch
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] > max_width and current:
            lines.append(current)
            current = ch
        else:
            current = test
    if current:
        lines.append(current)
    return lines

def draw_grid(draw, w, h, spacing=60):
    """科技风网格背景"""
    for x in range(0, w, spacing):
        alpha = max(0, 15 - abs(x - w//2) * 15 // (w//2))
        if alpha > 0:
            draw.line([(x, 0), (x, h)], fill=(0, 150, 255, alpha))
    for y in range(0, h, spacing):
        alpha = max(0, 15 - abs(y - h//2) * 15 // (h//2))
        if alpha > 0:
            draw.line([(0, y), (w, y)], fill=(0, 150, 255, alpha))

def draw_city_skyline(draw, w, h, color):
    """城市天际线剪影"""
    buildings = []
    x = 0
    while x < w:
        bw = random.randint(30, 80)
        bh = random.randint(60, 180)
        buildings.append((x, bw, bh))
        x += bw + random.randint(2, 8)
    for bx, bw, bh in buildings:
        draw.rectangle([(bx, h - bh), (bx + bw, h)], fill=color)
        # 窗口
        for wy in range(h - bh + 10, h - 5, 15):
            for wx in range(bx + 5, bx + bw - 5, 10):
                if random.random() < 0.6:
                    win_color = (255, 200, 50, random.randint(30, 80))
                    draw.rectangle([(wx, wy), (wx + 6, wy + 8)], fill=win_color)

def draw_hologram_circle(draw, cx, cy, r, color):
    """全息投影圆环"""
    for i in range(5):
        ri = r - i * 12
        if ri < 10:
            break
        draw.ellipse([(cx - ri, cy - ri), (cx + ri, cy + ri)],
                     outline=(color[0], color[1], color[2], max(10, 50 - i * 10)),
                     width=1)
    # 十字线
    draw.line([(cx - r, cy), (cx + r, cy)], fill=(color[0], color[1], color[2], 30))
    draw.line([(cx, cy - r), (cx, cy + r)], fill=(color[0], color[1], color[2], 30))

def draw_data_lines(draw, w, h):
    """数据流线条装饰"""
    for _ in range(8):
        y = random.randint(100, h - 100)
        points = [(random.randint(0, w), y + random.randint(-40, 40))
                  for _ in range(5)]
        for i in range(len(points) - 1):
            draw.line([points[i], points[i + 1]],
                      fill=(0, 180, 255, random.randint(10, 30)),
                      width=1)

# === 每个场景的自定义图像设计 ===
scene_configs = {
    0: {  # 前言：台风来临前城市全景
        "bg_base": (5, 8, 20),
        "bg_highlight": (80, 30, 20),
        "draw_extra": lambda d, w, h: (
            draw_city_skyline(d, w, h, (15, 10, 30)),
            draw_hologram_circle(d, w * 0.78, h * 0.38, 180, (0, 180, 255)),
        )
    },
    1: {  # 第1章：沿海城市航拍
        "bg_base": (10, 12, 25),
        "bg_highlight": (60, 50, 20),
        "draw_extra": lambda d, w, h: (
            draw_city_skyline(d, w, h, (10, 15, 35)),
            # 海岸线弧线
            d.arc([(w * 0.2, h * 0.2), (w * 0.9, h * 0.7)], 0, 180,
                  fill=(0, 150, 200, 50), width=3),
        )
    },
    2: {  # 第1章 P3：应急指挥中心
        "bg_base": (8, 10, 22),
        "bg_highlight": (40, 50, 80),
        "draw_extra": lambda d, w, h: (
            draw_grid(d, w, h, 50),
            draw_data_lines(d, w, h),
            draw_hologram_circle(d, w * 0.7, h * 0.5, 100, (100, 200, 255)),
        )
    },
    3: {  # 第2章：夜间指挥中心
        "bg_base": (5, 5, 18),
        "bg_highlight": (50, 40, 80),
        "draw_extra": lambda d, w, h: (
            draw_grid(d, w, h, 40),
            draw_data_lines(d, w, h),
            draw_hologram_circle(d, w * 0.75, h * 0.5, 130, (80, 180, 255)),
        )
    },
    4: {  # 第3章：超大规模指挥中心
        "bg_base": (3, 5, 15),
        "bg_highlight": (60, 40, 100),
        "draw_extra": lambda d, w, h: (
            draw_grid(d, w, h, 35),
            draw_data_lines(d, w, h),
            draw_hologram_circle(d, w * 0.72, h * 0.5, 150, (60, 160, 255)),
        )
    },
    5: {  # 第3章 P3：联合值守
        "bg_base": (8, 6, 18),
        "bg_highlight": (70, 50, 40),
        "draw_extra": lambda d, w, h: (
            draw_data_lines(d, w, h),
            draw_hologram_circle(d, w * 0.74, h * 0.48, 120, (100, 180, 255)),
        )
    },
    6: {  # 第4章：三级联动视频会商
        "bg_base": (5, 5, 20),
        "bg_highlight": (50, 50, 90),
        "draw_extra": lambda d, w, h: (
            draw_grid(d, w, h, 45),
            draw_data_lines(d, w, h),
            draw_hologram_circle(d, w * 0.7, h * 0.5, 140, (80, 170, 255)),
        )
    },
    7: {  # 第4章 P3：武警转移群众
        "bg_base": (10, 8, 22),
        "bg_highlight": (60, 40, 30),
        "draw_extra": lambda d, w, h: (
            draw_city_skyline(d, w, h, (12, 8, 25)),
            draw_hologram_circle(d, w * 0.76, h * 0.45, 100, (100, 200, 255)),
        )
    },
}

# 场景标注
scene_labels = [
    "🌪 台风将至 · 城市全景",
    "🏙 沿海城市 · 鸟瞰航拍",
    "🖥 应急指挥中心 · 科技调度",
    "🌃 夜间指挥 · 协同会商",
    "🛰 全域联动 · GIS指挥",
    "🏢 联合值守 · 应急响应",
    "📡 三级联动 · 视频会商",
    "🚤 武警转移 · 风雨救援",
]

title_font_large = get_font(FONT_BOLD, 28)
title_font = get_font(FONT_BOLD, 20)
body_font = get_font(FONT_REG, 16)
small_font = get_font(FONT_REG, 13)
tiny_font = get_font(FONT_REG, 12)

for i, img in enumerate(images):
    filename = os.path.join('public/knowledge-images', img['filename'])

    if os.path.exists(filename):
        print(f"[{i+1}/{len(images)}] SKIP: {img['filename']}")
        continue

    cfg = scene_configs.get(i, scene_configs[0])
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    # === 暗色渐变背景 ===
    r1, g1, b1 = cfg['bg_base']
    r2, g2, b2 = cfg['bg_highlight']
    step_r = (r2 - r1) / H
    step_g = (g2 - g1) / H
    step_b = (b2 - b1) / H
    for y in range(H):
        rr = int(r1 + step_r * y)
        gg = int(g1 + step_g * y)
        bb = int(b1 + step_b * y)
        draw.line([(0, y), (W, y)], fill=(max(0, rr), max(0, gg), max(0, bb), 255))

    # === 场景专属装饰 ===
    if cfg.get('draw_extra'):
        cfg['draw_extra'](draw, W, H)

    # === 全局装饰：左侧光晕线条 ===
    for x in range(3):
        draw.line([(x, 0), (x, H)], fill=(100, 180, 255, 60 - x * 15))

    # === 顶部光晕 ===
    for y in range(60):
        draw.line([(0, y), (W, y)], fill=(0, 100, 200, max(0, 25 - y // 3)))

    # === 左上角：场景标识 ===
    label = scene_labels[i] if i < len(scene_labels) else ""
    draw.text((30, 28), label, fill=(120, 200, 255, 200), font=title_font_large)

    # === 分隔线 ===
    draw.line([(30, 70), (550, 70)], fill=(0, 150, 255, 120), width=2)

    # === 提示词标签 ===
    draw.text((30, 90), '▎配图提示词', fill=(100, 200, 255, 200), font=title_font)
    draw.line([(30, 116), (180, 116)], fill=(0, 150, 255, 60), width=1)

    # === 提示词正文 ===
    prompt = img['prompt']
    wrapped = wrap_text(draw, prompt, body_font, 700)
    y_pos = 135
    for line in wrapped:
        draw.text((30, y_pos), line, fill=(180, 210, 240, 220), font=body_font)
        y_pos += 26

    # === 底部信息区 ===
    draw.line([(30, H - 50), (W - 30, H - 50)], fill=(0, 100, 200, 40), width=1)
    draw.text((30, H - 38), f'此图根据提示词生成  |  文件: {img["filename"]}  |  建议尺寸: 1280×720',
              fill=(100, 150, 200, 150), font=tiny_font)

    # === 右下角科技标签 ===
    draw.text((W - 200, H - 38), '#Cinematic #Scene',
              fill=(0, 150, 255, 80), font=tiny_font)

    # === 合成并保存 ===
    bg = Image.new('RGB', (W, H), (5, 8, 22))
    bg.paste(im, (0, 0), im)
    bg.save(filename, 'PNG', optimize=True)

    size_kb = os.path.getsize(filename) / 1024
    print(f"[{i+1}/{len(images)}] {img['filename']} ({size_kb:.1f} KB)")
    print(f"  {label}")
    print(f"  {img['prompt'][:80]}...")
    print()

print(f"\n全部完成: {len(images)} 张酷炫场景风占位图")