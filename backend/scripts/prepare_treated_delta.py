import os
from PIL import Image, ImageChops

DELTA_ASSETS = {
    "DT-ADA01": "/tmp/delta/docx_extracted/word/media/image1.png",
    "DT-ALI06": "/tmp/delta/delta2024_raw_images/img-062.png",
    "DT-ALI07": "/tmp/delta/docx_extracted/word/media/image2.png",
    "DT-ATB01": "/tmp/delta/docx_extracted/word/media/image11.png",
    "DT-JSQ01": "/tmp/delta/delta2024_raw_images/img-257.png",
    "DT-KMF01": "/tmp/delta/delta2024_raw_images/img-373.png",
    "DT-MAT01": "/tmp/delta/delta2024_raw_images/img-338.png",
    "DT-MFT01": "/tmp/delta/site_images/70ea6e_11900ff79cd14b6aa3544e1dbea86c4b~mv2.jpg",
    "DT-MGA01": "/tmp/delta/docx_extracted/word/media/image45.png",
    "DT-MGA01EA": "/tmp/delta/site_images/70ea6e_c63df2c968d444b0b8140f0e6f25a6a3~mv2.jpeg",
    "DT-MGA01EB": "/tmp/delta/site_images/70ea6e_f6a1789cbe08473c85fe223a09b317dc~mv2.jpeg",
    "DT-PEN007": "/tmp/delta/docx_extracted/word/media/image11.png",
    "DT-REC": "/tmp/delta/site_images/70ea6e_b4660d647e4c4c1db8d1b00a0578e186~mv2.jpg",
    "DT-REP01": "/tmp/delta/docx_extracted/word/media/image28.png",
    "DT-SAC04": "/tmp/delta/docx_extracted/word/media/image32.jpg",
    "DT-SAC07": "/tmp/delta/delta2024_raw_images/img-060.png",
    "DT-SAC08": "/tmp/delta/docx_extracted/word/media/image26.jpg",
    "DT-SAC10": "/tmp/delta/site_images/b9ec42_ef89ee10eb4f438ebc0e866c005b01f2~mv2.png",
    "DT-SAC15": "/tmp/delta/docx_extracted/word/media/image4.png",
    "DT-SAC16": "/tmp/delta/delta2024_raw_images/img-076.png",
    "DT-SAC20": "/tmp/delta/delta2024_raw_images/img-021.png",
    "DT-SFB01": "/tmp/delta/delta2024_raw_images/img-152.png",
    "DT-SGF01": "/tmp/delta/docx_extracted/word/media/image37.jpg",
    "DT-SGF02": "/tmp/delta/site_images/b9ec42_be7d68edcc5542c09bfafaab09fb070a~mv2.png",
    "DT-SGF02.R": "/tmp/delta/docx_extracted/word/media/image38.png",
    "DT-SSO01": "/tmp/delta/site_images/b9ec42_cb3fb8045c6940cba42a659dd5e1e8ba~mv2.jpg",
    "DT-TBD01": "/tmp/delta/docx_extracted/word/media/image39.png",
    "DT-TFR01": "/tmp/delta/docx_extracted/word/media/image8.png",
    "SAC-01": "/tmp/delta/docx_extracted/word/media/image29.png"
}

os.makedirs("/tmp/delta/treated_v3", exist_ok=True)
target_size = 1000
pad = 0.08

for sku, src in DELTA_ASSETS.items():
    out_name = sku.lower().replace(".", "-") + ".webp"
    out_path = f"/tmp/delta/treated_v3/{out_name}"
    
    im = Image.open(src)
    
    # Special crop for DT-SGF02.R from image38: left side only
    if sku == "DT-SGF02.R" and "image38" in src:
        im = im.crop((0, 0, int(im.width * 0.45), im.height))
    # Special crop for DT-SGF02 from site image: right side only
    elif sku == "DT-SGF02" and "be7d68" in src:
        im = im.crop((int(im.width * 0.38), 0, im.width, im.height))
        
    # Convert RGBA / P to RGBA with white composite
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        im = im.convert("RGBA")
        white_bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
        im = Image.alpha_composite(white_bg, im).convert("RGB")
    else:
        im = im.convert("RGB")
        
    # Trim pure/near white borders
    bg = Image.new("RGB", im.size, (255, 255, 255))
    diff = ImageChops.difference(im, bg)
    diff = diff.point(lambda p: 255 if p > 15 else 0)
    bbox = diff.getbbox()
    if bbox:
        m = 5
        bx0 = max(0, bbox[0] - m)
        by0 = max(0, bbox[1] - m)
        bx1 = min(im.width, bbox[2] + m)
        by1 = min(im.height, bbox[3] + m)
        im = im.crop((bx0, by0, bx1, by1))
        
    w, h = im.size
    max_dim = int(target_size * (1 - 2 * pad))
    scale = min(max_dim / w, max_dim / h)
    new_w = max(1, int(w * scale))
    new_h = max(1, int(h * scale))
    
    resized = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (target_size, target_size), (255, 255, 255))
    ox = (target_size - new_w) // 2
    oy = (target_size - new_h) // 2
    canvas.paste(resized, (ox, oy))
    canvas.save(out_path, "WEBP", quality=92)
    print(f"Processed [{sku}] -> {out_name} (from {src})")

print("All 29 Delta treated photos generated successfully!")
