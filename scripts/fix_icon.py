from PIL import Image
import os

def add_padding(image_path, padding_ratio=0.35):
    try:
        if not os.path.exists(image_path):
            print(f"File not found: {image_path}")
            return

        print(f"Processing {image_path}...")
        img = Image.open(image_path).convert("RGBA")
        width, height = img.size
        
        # Calculate new size to fit in safe zone
        # Android safe zone is roughly circle of diameter 72/108 = 66%
        # We shrink to ~60% to be safe (padding_ratio=0.4)
        
        target_size_ratio = 1.0 - padding_ratio
        new_w = int(width * target_size_ratio)
        new_h = int(height * target_size_ratio)
        
        # Resize original image
        img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Create new canvas
        new_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        
        # Center pasted image
        x = (width - new_w) // 2
        y = (height - new_h) // 2
        
        new_img.paste(img_resized, (x, y), img_resized)
        
        # Save back to same path
        new_img.save(image_path)
        print(f"Success! Scaled content to {int(target_size_ratio*100)}% of original size.")
        
    except Exception as e:
        print(f"Error: {e}")

# Fix adaptive icon
add_padding("assets/images/adaptive-icon.png", padding_ratio=0.35)
