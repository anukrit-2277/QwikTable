"""Refined conversion: remove ALL background artifacts from the logo.
The source JPG has a checkered gray+white background. We need to aggressively
remove everything that isn't clearly part of the dark logo artwork.
"""
from PIL import Image
import numpy as np

# Re-read from original source (the JPG)
src = "/Users/anukrit77/.gemini/antigravity/brain/7431c7e6-959b-4ff1-9d5c-30ffe259cecb/media__1777481497442.jpg"
img = Image.open(src).convert("RGBA")
data = np.array(img)

r, g, b = data[:,:,0].astype(float), data[:,:,1].astype(float), data[:,:,2].astype(float)
luminance = 0.299 * r + 0.587 * g + 0.114 * b

# More aggressive thresholds to fully eliminate the checkered pattern
# The checkerboard uses ~204 (light gray) and ~255 (white)
# Logo artwork is solidly dark (< ~100)
threshold_low = 100   # Below = fully opaque logo
threshold_high = 150  # Above = fully transparent background

new_alpha = np.zeros(luminance.shape, dtype=np.uint8)
mask_opaque = luminance <= threshold_low
mask_transparent = luminance >= threshold_high
mask_gradient = (~mask_opaque) & (~mask_transparent)

new_alpha[mask_opaque] = 255
new_alpha[mask_transparent] = 0
new_alpha[mask_gradient] = (255 * (1 - (luminance[mask_gradient] - threshold_low) / (threshold_high - threshold_low))).astype(np.uint8)

# Make all non-transparent pixels pure black for clean edges
data[:,:,0] = 0
data[:,:,1] = 0
data[:,:,2] = 0
data[:,:,3] = new_alpha

result = Image.fromarray(data)

# Crop to content (remove transparent padding)
bbox = result.getbbox()
if bbox:
    result = result.crop(bbox)

result.save("/Users/anukrit77/Desktop/QwikTable/public/logo.png")
print(f"✅ Saved transparent logo.png ({result.size[0]}x{result.size[1]})")

# White version
data_w = np.array(result)
data_w[:,:,0] = 255
data_w[:,:,1] = 255
data_w[:,:,2] = 255
white_result = Image.fromarray(data_w)
white_result.save("/Users/anukrit77/Desktop/QwikTable/public/logo-white.png")
print(f"✅ Saved logo-white.png")

# Favicons
result.resize((32, 32), Image.LANCZOS).save("/Users/anukrit77/Desktop/QwikTable/public/favicon-32.png")
result.resize((16, 16), Image.LANCZOS).save("/Users/anukrit77/Desktop/QwikTable/public/favicon-16.png")
result.resize((180, 180), Image.LANCZOS).save("/Users/anukrit77/Desktop/QwikTable/public/apple-touch-icon.png")
result.resize((32, 32), Image.LANCZOS).save("/Users/anukrit77/Desktop/QwikTable/src/app/favicon.ico")
print("✅ Regenerated favicons")
