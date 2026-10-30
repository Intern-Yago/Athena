import os
from PIL import Image, ImageChops

def clean_white_crop(page_num, box, target_size=1000, pad=0.08):
    im = Image.open(f"/tmp/delta/delta300_pages/p-{page_num:02d}.png")
    cropped = im.crop(box).convert("RGB")
    
    # Auto-trim white
    bg = Image.new("RGB", cropped.size, (255, 255, 255))
    diff = ImageChops.difference(cropped, bg)
    diff = diff.point(lambda p: 255 if p > 18 else 0)
    bbox = diff.getbbox()
    if bbox:
        m = 8
        bx0 = max(0, bbox[0] - m)
        by0 = max(0, bbox[1] - m)
        bx1 = min(cropped.width, bbox[2] + m)
        by1 = min(cropped.height, bbox[3] + m)
        cropped = cropped.crop((bx0, by0, bx1, by1))
        
    w, h = cropped.size
    max_dim = int(target_size * (1 - 2 * pad))
    scale = min(max_dim / w, max_dim / h)
    new_w = max(1, int(w * scale))
    new_h = max(1, int(h * scale))
    
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (target_size, target_size), (255, 255, 255))
    ox = (target_size - new_w) // 2
    oy = (target_size - new_h) // 2
    canvas.paste(resized, (ox, oy))
    return canvas

# Exact clean tool crops from 300 DPI:
clean_white_crop(32, (150, 650, 950, 1400)).save("/tmp/delta/treated_v3/dt-ali07.webp", "WEBP", quality=92)
clean_white_crop(9, (1650, 500, 2350, 950)).save("/tmp/delta/treated_v3/dt-sso01.webp", "WEBP", quality=92)
clean_white_crop(34, (1480, 2730, 2200, 3200)).save("/tmp/delta/treated_v3/dt-mga01ea.webp", "WEBP", quality=92)
clean_white_crop(34, (1660, 2250, 2350, 2750)).save("/tmp/delta/treated_v3/dt-mga01eb.webp", "WEBP", quality=92)
clean_white_crop(26, (1450, 1500, 2250, 2150)).save("/tmp/delta/treated_v3/dt-mat01.webp", "WEBP", quality=92)
clean_white_crop(4, (250, 750, 1050, 1550)).save("/tmp/delta/treated_v3/dt-atb01.webp", "WEBP", quality=92)
clean_white_crop(10, (150, 2600, 1000, 3100)).save("/tmp/delta/treated_v3/dt-sfb01.webp", "WEBP", quality=92)
clean_white_crop(23, (140, 2350, 1350, 3200)).save("/tmp/delta/treated_v3/dt-kmf01.webp", "WEBP", quality=92)
clean_white_crop(10, (150, 1900, 950, 2450)).save("/tmp/delta/treated_v3/dt-sac07.webp", "WEBP", quality=92)
clean_white_crop(27, (150, 700, 1050, 1550)).save("/tmp/delta/treated_v3/dt-jsq01.webp", "WEBP", quality=92)

print("Refinements applied!")
