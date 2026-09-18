from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from enhancer import enhance_image

app = FastAPI(title="Lunar Vision API", description="API for enhancing lunar images")

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Lunar Vision API"}

@app.post("/api/enhance")
async def enhance(file: UploadFile = File(...), model: str = Form("clahe")):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        contents = await file.read()
        print(f"File size: {len(contents)} bytes")
        print(f"File signature: {contents[:20]}")
        enhanced_bytes = enhance_image(contents, model)
        return Response(content=enhanced_bytes, media_type="image/png")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
