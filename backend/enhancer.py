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
        # ADVANCED ENHANCEMENT PIPELINE (Clarity, Contrast, Sharpness)
        
        # 1. Upscale for better working resolution
        height, width = img.shape[:2]
        upscaled = cv2.resize(img, (width * 2, height * 2), interpolation=cv2.INTER_CUBIC)
        
        # 2. CLARITY / DEHAZE: Pull out hidden details using local contrast enhancement
        clarity = cv2.detailEnhance(upscaled, sigma_s=20, sigma_r=0.15)
        
        # 3. CONTRAST: Separate shadows from highlights to make edges pop
        # Alpha > 1 increases contrast. Beta < 0 pulls shadows down to make them darker.
        contrast = cv2.convertScaleAbs(clarity, alpha=1.4, beta=-40)
        
        # 4. SHARPNESS: Define the textures using an Unsharp Mask
        blur = cv2.GaussianBlur(contrast, (0, 0), 2.5)
        sharpened = cv2.addWeighted(contrast, 1.8, blur, -0.8, 0)
        
        enhanced_img = sharpened
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
