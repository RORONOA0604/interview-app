# /api/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from parser import ResumeParser  # Your local parser for name, email, etc.

# Initialize FastAPI app
app = FastAPI()

# Configure CORS to allow your frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development. Change to your Vercel URL in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoint 1: PDF Parsing (This is the only endpoint left) ---
@app.post("/api/extract-pdf")
async def extract_pdf(resume: UploadFile = File(...)):
    if resume.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    try:
        parser = ResumeParser()
        result = parser.parse_resume(resume.file)
        
        if result.get('error'):
             raise HTTPException(status_code=400, detail=result['error'])

        return {
            "name": result.get('name'),
            "email": result.get('email'),
            "phone": result.get('phone')
        }
    except Exception as e:
        print(f"An unexpected error occurred during PDF parsing: {e}")
        raise HTTPException(status_code=500, detail="Failed to process the PDF.")

# --- Health Check Endpoints ---
@app.get("/")
async def root():
    return {"message": "AI Interview API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}