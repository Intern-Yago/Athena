from PIL import Image, ImageChops
import os

DELTA_PRODUCTS_MAPPING = {
    # 1. Page 6: DT-ADA01 - bottom left
    "DT-ADA01": {"page": 6, "box": (300, 2450, 850, 3100)},
    
    # 2. Page 7: DT-ALI06 - top right
    "DT-ALI06": {"page": 7, "box": (1500, 600, 2400, 1450)},
    
    # 3. Page 32: DT-ALI07 - top left
    "DT-ALI07": {"page": 32, "box": (150, 650, 950, 1400)},
    
    # 4. Page 4: DT-ATB01 - top left
    "DT-ATB01": {"page": 4, "box": (250, 750, 1050, 1550)},
    
    # 5. Page 27: DT-JSQ01 - top left
    "DT-JSQ01": {"page": 27, "box": (150, 700, 1050, 1550)},
    
    # 6. Page 23: DT-KMF01 - bottom left
    "DT-KMF01": {"page": 23, "box": (140, 2350, 1350, 3200)},
    
    # 7. Page 26: DT-MAT01 - middle right
    "DT-MAT01": {"page": 26, "box": (1450, 1500, 2250, 2150)},
    
    # 8. Page 23: DT-MFT01 - bottom right
    "DT-MFT01": {"page": 23, "box": (1350, 1600, 2450, 3200)},
    
    # 9. Page 34: DT-MGA01 - middle right (Manifold set with hoses & case)
    "DT-MGA01": {"page": 34, "box": (1500, 1250, 2400, 1850)},
    
    # 10. Page 34: DT-MGA01EA - bottom right (red coupler)
    "DT-MGA01EA": {"page": 34, "box": (1480, 2730, 2200, 3200)},
    
    # 11. Page 34: DT-MGA01EB - bottom right (blue coupler)
    "DT-MGA01EB": {"page": 34, "box": (1660, 2250, 2350, 2750)},
    
    # 12. Page 3: DT-PEN007 (same as DT-CAN03) - top left
    "DT-PEN007": {"page": 3, "box": (180, 800, 950, 1750)},
    
    # 13. Page 33: DT-REC - right
    "DT-REC": {"page": 33, "box": (1350, 1400, 2350, 2900)},
    
    # 14. Page 20: DT-REP01 - top right
    "DT-REP01": {"page": 20, "box": (1350, 600, 2400, 1850)},
    
    # 15. Page 34: DT-SAC04 - top right
    "DT-SAC04": {"page": 34, "box": (1550, 600, 2400, 1150)},
    
    # 16. Page 10: DT-SAC07 - slot 3 left (GDI puller)
    "DT-SAC07": {"page": 10, "box": (150, 1900, 950, 2450)},
    
    # 17. Page 10: DT-SAC08 - slot 2 left (diesel injector 40 pcs)
    "DT-SAC08": {"page": 10, "box": (200, 1200, 850, 1750)},
    
    # 18. Page 21: DT-SAC10 - bottom left
    "DT-SAC10": {"page": 21, "box": (200, 2680, 850, 3250)},
    
    # 19. Page 7: DT-SAC15 - bottom right (terminal wire tools)
    "DT-SAC15": {"page": 7, "box": (1500, 2400, 2450, 3150)},
    
    # 20. Page 24: DT-SAC16 - slot 3 right (broken screw extractor)
    "DT-SAC16": {"page": 24, "box": (1550, 1850, 2300, 2400)},
    
    # 21. Page 3: DT-SAC20 - bottom left
    "DT-SAC20": {"page": 3, "box": (200, 2150, 1000, 3100)},
    
    # 22. Page 10: DT-SFB01 - slot 4 left
    "DT-SFB01": {"page": 10, "box": (150, 2600, 1000, 3100)},
    
    # 23. Page 29: DT-SGF01 - middle right top (0.75L)
    "DT-SGF01": {"page": 29, "box": (1450, 1900, 2400, 2450)},
    
    # 24. Page 29: DT-SGF02 - bottom right (2L)
    "DT-SGF02": {"page": 29, "box": (1500, 2460, 2400, 3200)},
    
    # 25. Page 30: DT-SGF02.R - top left
    "DT-SGF02.R": {"page": 30, "box": (300, 550, 800, 1200)},
    
    # 26. Page 9: DT-SSO01 - top right
    "DT-SSO01": {"page": 9, "box": (1650, 500, 2350, 950)},
    
    # 27. Page 5: DT-TBD01 - top right
    "DT-TBD01": {"page": 5, "box": (1380, 600, 2400, 1500)},
    
    # 28. Page 22: DT-TFR01 - bottom right
    "DT-TFR01": {"page": 22, "box": (1600, 2700, 2250, 3350)},
    
    # 29. Page 6: SAC-01 - middle left
    "SAC-01": {"page": 6, "box": (150, 1650, 1050, 2050)},
}

def process_all(target_size=1000, pad_ratio=0.08):
    os.makedirs("/tmp/delta/crops_v2", exist_ok=True)
    
    for sku, info in DELTA_PRODUCTS_MAPPING.items():
        page_num = info["page"]
        box = info["box"]
        page_path = f"/tmp/delta/delta300_pages/p-{page_num:02d}.png"
        out_filename = sku.lower().replace(".", "-") + ".webp"
        out_path = f"/tmp/delta/crops_v2/{out_filename}"
        
        im = Image.open(page_path)
        cropped = im.crop(box)
        if cropped.mode != "RGB":
            cropped = cropped.convert("RGB")
            
        bg = Image.new("RGB", cropped.size, (255, 255, 255))
        diff = ImageChops.difference(cropped, bg)
        diff = diff.point(lambda p: 255 if p > 15 else 0)
        bbox = diff.getbbox()
        if bbox:
            m = 10
            bx0 = max(0, bbox[0] - m)
            by0 = max(0, bbox[1] - m)
            bx1 = min(cropped.width, bbox[2] + m)
            by1 = min(cropped.height, bbox[3] + m)
            cropped = cropped.crop((bx0, by0, bx1, by1))
            
        w, h = cropped.size
        max_dim = int(target_size * (1 - 2 * pad_ratio))
        scale = min(max_dim / w, max_dim / h)
        new_w = max(1, int(w * scale))
        new_h = max(1, int(h * scale))
        
        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", (target_size, target_size), (255, 255, 255))
        offset_x = (target_size - new_w) // 2
        offset_y = (target_size - new_h) // 2
        canvas.paste(resized, (offset_x, offset_y))
        canvas.save(out_path, "WEBP", quality=92)
        print(f"[{sku}] Page {page_num} -> {out_filename} (Crop: {w}x{h})")

if __name__ == "__main__":
    process_all()
