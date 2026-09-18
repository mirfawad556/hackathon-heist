import cv2
import numpy as np
from PIL import Image
import io

def enhance_image(image_bytes: bytes, model: str = "clahe") -> bytes:
    """
    Enhances a low-light image using either OpenCV CLAHE or a simulated Deep Learning pipeline.
    """
    try:
        # Robustly load the image using Pillow
        pil_img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB to ensure we don't have alpha channels messing up OpenCV
        if pil_img.mode != 'RGB':
            pil_img = pil_img.convert('RGB')
            
        # Convert to numpy array
        nparr = np.array(pil_img)
        
        # Convert from RGB to BGR for OpenCV
        img = cv2.cvtColor(nparr, cv2.COLOR_RGB2BGR)
    except Exception as e:
        raise ValueError(f"Invalid image format: {str(e)}")
        
    if img is None:
        raise ValueError("Failed to convert image to OpenCV format")
        
    if model == "ai":
        # ADVANCED ENHANCEMENT PIPELINE (Super High-Contrast Lunar Style)
        
        # 1. Convert to grayscale. Lunar images look much punchier without chromatic noise.
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 2. Upscale for better working resolution (keeps edges cleaner during aggressive sharpening)
        height, width = gray.shape[:2]
        upscaled = cv2.resize(gray, (width * 2, height * 2), interpolation=cv2.INTER_CUBIC)
        
        # 3. Aggressive CLAHE to pull out incredible local contrast in the craters
        # Using a larger grid size (16,16) because the image is upscaled, preventing localized haloing
        clahe = cv2.createCLAHE(clipLimit=6.0, tileGridSize=(16, 16))
        local_contrast = clahe.apply(upscaled)
        
        # 4. Global Contrast Boost: Crush the blacks and blow out the highlights slightly for that punchy look
        global_contrast = cv2.convertScaleAbs(local_contrast, alpha=1.5, beta=-40)
        
        # 5. Edge-Preserving Denoise: Smooth out flat areas so we don't sharpen sensor noise, only real edges
        denoised = cv2.bilateralFilter(global_contrast, d=9, sigmaColor=75, sigmaSpace=75)
        
        # 6. Extreme Sharpening (Unsharp Mask) to make the crater rims razor sharp
        blur = cv2.GaussianBlur(denoised, (0, 0), 3.0)
        sharpened = cv2.addWeighted(denoised, 2.5, blur, -1.5, 0)
        
        # Convert back to BGR so it saves properly as a standard image
        enhanced_img = cv2.cvtColor(sharpened, cv2.COLOR_GRAY2BGR)
    else:
        # TRADITIONAL CLAHE PIPELINE
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        enhanced_img = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    
    # Encode image to bytes
    success, encoded_img = cv2.imencode('.png', enhanced_img)
    if not success:
        raise ValueError("Failed to encode image")
        
    return encoded_img.tobytes()
