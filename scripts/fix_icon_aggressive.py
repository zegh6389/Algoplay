from PIL import Image
import os

def shrink_content(image_path, scale_factor=0.5):
    try:
        if not os.path.exists(image_path):
            print(f"File not found: {image_path}")
            return

        print(f"Processing {image_path} with scale {scale_factor}...")
        img = Image.open(image_path).convert("RGBA")
        width, height = img.size
        
        # Calculate new dimensions
        new_w = int(width * scale_factor)
        new_h = int(height * scale_factor)
        
        # Resize original image
        img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Create new canvas with transparent background
        new_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        
        # Center pasted image
        x = (width - new_w) // 2
        y = (height - new_h) // 2
        
        new_img.paste(img_resized, (x, y), img_resized)
        
        # Save back to same path
        new_img.save(image_path)
        print(f"Success! Scaled content to {int(scale_factor*100)}% of original size.")
        
    except Exception as e:
        print(f"Error: {e}")

# Shrink adaptive icon aggressively to 50% to ensure NO cropping even on wide text
shrink_content("assets/images/adaptive-icon.png", scale_factor=0.5)
