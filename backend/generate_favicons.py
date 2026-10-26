import os
import base64
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

def build_favicons():
    avatar_path = r'D:\Sanjay\workspace\doodh-ledger\backend\avatar_cropped.png'
    char = Image.open(avatar_path).convert('RGBA')
    cw, ch = char.size

    def generate_icon(size):
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Outer squircle
        r = max(2, int(size * 0.22))
        pad = max(1, int(size * 0.02))
        
        # Border width tuned for visibility at each scale
        if size <= 16:
            border_w = 2
        elif size <= 32:
            border_w = 3
        elif size <= 48:
            border_w = 4
        elif size <= 64:
            border_w = 5
        else:
            border_w = max(6, int(size * 0.055))
            
        # Draw emerald green squircle (#059669)
        draw.rounded_rectangle([(pad, pad), (size - 1 - pad, size - 1 - pad)], radius=r, fill=(5, 150, 105, 255))
        
        # Draw crisp white interior
        inner_pad = pad + border_w
        inner_r = max(1, r - border_w)
        draw.rounded_rectangle([(inner_pad, inner_pad), (size - 1 - inner_pad, size - 1 - inner_pad)], radius=inner_r, fill=(255, 255, 255, 255))
        
        # Calculate character size to fill inner space
        inner_w = size - inner_pad * 2
        inner_h = size - inner_pad * 2
        
        # Character fills ~94% of inner width/height
        scale_w = int(inner_w * 0.94)
        scale_h = int(ch * (scale_w / cw))
        if scale_h > int(inner_h * 0.96):
            scale_h = int(inner_h * 0.96)
            scale_w = int(cw * (scale_h / ch))
            
        char_res = char.resize((scale_w, scale_h), Image.Resampling.LANCZOS)
        
        # Subtle sharpening for smaller sizes to make outlines and facial features pop
        if size <= 32:
            enhancer = ImageEnhance.Sharpness(char_res)
            char_res = enhancer.enhance(1.4)
        elif size <= 64:
            enhancer = ImageEnhance.Sharpness(char_res)
            char_res = enhancer.enhance(1.2)
            
        px = (size - char_res.width) // 2
        py = (size - char_res.height) // 2 + max(1, int(size * 0.015))
        img.paste(char_res, (px, py), char_res)
        return img

    pub_dir = r'D:\Sanjay\workspace\doodh-ledger\frontend\public'

    i16 = generate_icon(16)
    i24 = generate_icon(24)
    i32 = generate_icon(32)
    i48 = generate_icon(48)
    i64 = generate_icon(64)
    i128 = generate_icon(128)
    i180 = generate_icon(180)
    i192 = generate_icon(192)
    i256 = generate_icon(256)
    i512 = generate_icon(512)

    # 1. Multi-resolution favicon.ico containing all standard sizes
    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    # In Pillow, to save multi-resolution ICO, pass a list of sizes:
    # Save base 256x256 image with sizes parameter
    ico_path = os.path.join(pub_dir, 'favicon.ico')
    # Create an ICO with multiple frames
    frames = [generate_icon(s[0]) for s in ico_sizes]
    frames[0].save(ico_path, format='ICO', append_images=frames[1:], sizes=ico_sizes)

    # 2. Save individual PNGs
    i16.save(os.path.join(pub_dir, 'favicon-16x16.png'))
    i32.save(os.path.join(pub_dir, 'favicon-32x32.png'))
    i180.save(os.path.join(pub_dir, 'apple-touch-icon.png'))
    i192.save(os.path.join(pub_dir, 'icon-192.png'))
    i512.save(os.path.join(pub_dir, 'icon-512.png'))
    i512.save(os.path.join(pub_dir, 'favicon.png'))

    # Also save to frontend/src/assets if folder exists
    src_assets = r'D:\Sanjay\workspace\doodh-ledger\frontend\src\assets'
    if os.path.exists(src_assets):
        i512.save(os.path.join(src_assets, 'favicon.png'))

    # 3. Save favicon.svg embedding the high-res 512 png
    with open(os.path.join(pub_dir, 'icon-512.png'), 'rb') as f:
        b64_data = base64.b64encode(f.read()).decode('utf-8')

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,{b64_data}" width="512" height="512" />
</svg>'''

    with open(os.path.join(pub_dir, 'favicon.svg'), 'w', encoding='utf-8') as f:
        f.write(svg_content)

    print('All favicon and app icon assets saved successfully!')

if __name__ == '__main__':
    build_favicons()
