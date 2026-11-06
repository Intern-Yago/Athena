import os
from PIL import Image

PAGES_DIR = '/tmp/delta/delta300_pages'
OUT_DIR = '/tmp/delta/crops'
os.makedirs(OUT_DIR, exist_ok=True)

# Precise coordinates: (sku, page_num, (x0, y0, x1, y1))
CROPS = [
    # Page 03: DT-PEN007 / DT-CAN03 (Top), DT-SAC20 (Bottom)
    ('DT-PEN007', 3, (200, 700, 950, 1800)),
    ('DT-SAC20', 3, (200, 2150, 950, 3100)),

    # Page 04: DT-ATB01 (Top)
    ('DT-ATB01', 4, (150, 700, 1050, 1750)),

    # Page 05: DT-TBD01 (Top)
    ('DT-TBD01', 5, (150, 700, 1050, 1750)),

    # Page 06: SAC-01 (Middle), DT-ADA01 (Bottom)
    ('SAC-01', 6, (150, 1500, 980, 2150)),
    ('DT-ADA01', 6, (150, 2450, 980, 3100)),

    # Page 07: DT-ALI06 (Top), DT-SAC15 (Bottom)
    ('DT-ALI06', 7, (160, 600, 980, 1350)),
    ('DT-SAC15', 7, (160, 2400, 980, 3100)),

    # Page 09: DT-SSO01 (Top)
    ('DT-SSO01', 9, (150, 600, 950, 1150)),

    # Page 10: DT-SAC08 (Slot 2), DT-SAC07 (Slot 3), DT-SFB01 (Slot 4)
    ('DT-SAC08', 10, (150, 1260, 950, 1750)),
    ('DT-SAC07', 10, (150, 1950, 950, 2450)),
    ('DT-SFB01', 10, (160, 2680, 950, 3050)),

    # Page 20: DT-REP01 (Top)
    ('DT-REP01', 20, (150, 650, 1050, 1750)),

    # Page 21: DT-SAC10 (Slot 4 - bottom right/left)
    ('DT-SAC10', 21, (150, 2650, 950, 3150)),

    # Page 22: DT-TFR01 / DT-TRF01 (Bottom right)
    ('DT-TFR01', 22, (1650, 2760, 2350, 3250)),

    # Page 23: DT-KMF01 (Bottom Left Maleta), DT-MFT01 (Bottom Right Máquina ATF)
    ('DT-KMF01', 23, (140, 2420, 860, 3180)),
    ('DT-MFT01', 23, (1320, 1650, 2350, 3150)),

    # Page 24: DT-SAC16 (Slot 3)
    ('DT-SAC16', 24, (150, 1920, 980, 2480)),

    # Page 26: DT-MAT01 (Middle)
    ('DT-MAT01', 26, (150, 1500, 980, 2250)),

    # Page 27: DT-JSQ01 (Top)
    ('DT-JSQ01', 27, (150, 650, 980, 1350)),

    # Page 29: DT-SGF01 (Bottom)
    ('DT-SGF01', 29, (150, 1950, 1050, 3100)),

    # Page 30: DT-SGF02 (Top left), DT-SGF02.R (Top right reservoir)
    ('DT-SGF02', 30, (150, 650, 780, 1700)),
    ('DT-SGF02.R', 30, (800, 650, 1150, 1700)),

    # Page 32: DT-ALI07 (Top)
    ('DT-ALI07', 32, (150, 650, 1050, 1750)),

    # Page 33: DT-REC (Recicladora - Bottom)
    ('DT-REC', 33, (150, 1550, 1200, 3100)),

    # Page 34: DT-SAC04, DT-MGA01, DT-MGA01EA, DT-MGA01EB
    ('DT-SAC04', 34, (150, 580, 950, 1150)),
    ('DT-MGA01', 34, (150, 1280, 950, 1850)),
    ('DT-MGA01EA', 34, (150, 1960, 950, 2480)),
    ('DT-MGA01EB', 34, (150, 2620, 950, 3150))
]

def clean_and_square(crop_img):
    gray = crop_img.convert('L')
    mask = gray.point(lambda p: 255 if p < 245 else 0)
    bbox = mask.getbbox()
    if bbox:
        pad = 25
        x0 = max(0, bbox[0] - pad)
        y0 = max(0, bbox[1] - pad)
        x1 = min(crop_img.width, bbox[2] + pad)
        y1 = min(crop_img.height, bbox[3] + pad)
        crop_img = crop_img.crop((x0, y0, x1, y1))

    cw, ch = crop_img.size
    sq_size = int(max(cw, ch) * 1.15)
    sq = Image.new('RGB', (sq_size, sq_size), (255, 255, 255))
    sq.paste(crop_img, ((sq_size - cw) // 2, (sq_size - ch) // 2))
    return sq.resize((1000, 1000), Image.Resampling.LANCZOS)

for sku, pnum, box in CROPS:
    pfile = f'{PAGES_DIR}/p-{pnum:02d}.png' if os.path.exists(f'{PAGES_DIR}/p-{pnum:02d}.png') else f'{PAGES_DIR}/p-{pnum}.png'
    pim = Image.open(pfile)
    c = pim.crop(box)
    res = clean_and_square(c)
    out_path = f'{OUT_DIR}/{sku}.webp'
    res.save(out_path, 'WEBP', quality=95)
    print(f'Done {sku} -> {out_path}')
