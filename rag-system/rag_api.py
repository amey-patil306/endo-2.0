from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import uvicorn
import os
from explanation_service import EndometriosisExplanationService

app = FastAPI(
    title="Endometriosis RAG API",
    description="AI-powered explanation service for endometriosis predictions",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize explanation service
try:
    explanation_service = EndometriosisExplanationService()
    print("✅ RAG service initialized successfully")
except Exception as e:
    print(f"⚠️ RAG service initialization failed: {e}")
    explanation_service = None

class ExplanationRequest(BaseModel):
    user_query: str
    prediction_result: Dict
    use_fallback: bool = False

class QuestionRequest(BaseModel):
    question: str
    prediction_result: Dict

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "Endometriosis RAG API",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "rag_service_loaded": explanation_service is not None,
        "api_version": "1.0.0"
    }

@app.post("/explain")
async def generate_explanation(request: ExplanationRequest):
    """Generate detailed explanation for prediction results."""
    try:
        if explanation_service is None:
            # Fallback response if service not available
            return {
                "explanation": get_fallback_explanation(request.prediction_result),
                "recommendations": get_fallback_recommendations(request.prediction_result),
                "risk_level": request.prediction_result.get("risk_level", "Unknown"),
                "confidence": request.prediction_result.get("confidence", 0),
                "prediction_summary": {
                    "label": request.prediction_result.get("prediction_label", "Unknown"),
                    "probability": request.prediction_result.get("probabilities", {}).get("endometriosis", 0),
                    "risk_level": request.prediction_result.get("risk_level", "Unknown")
                }
            }
        
        result = explanation_service.generate_explanation(
            user_query=request.user_query,
            prediction_result=request.prediction_result,
            use_fallback=request.use_fallback
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation generation failed: {str(e)}")

@app.post("/ask")
async def answer_question(request: QuestionRequest):
    """Answer specific questions about endometriosis."""
    try:
        if explanation_service is None:
            # Fallback answer if service not available
            answer = get_fallback_answer(request.question, request.prediction_result.get("risk_level", "moderate"))
            return {"answer": answer}
        
        answer = explanation_service.answer_specific_question(
            question=request.question,
            prediction_result=request.prediction_result
        )
        
        return {"answer": answer}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question answering failed: {str(e)}")

def get_fallback_explanation(prediction_result: Dict) -> str:
    """Generate fallback explanation when RAG service is unavailable."""
    risk_level = prediction_result.get("risk_level", "Unknown").lower()
    probability = prediction_result.get("probabilities", {}).get("endometriosis", 0)
    probability_percent = int(probability * 100)
    
    if risk_level == "high" or probability > 0.7:
        return f"""Your analysis shows a {probability_percent}% risk score, which indicates a higher likelihood that your symptoms may be related to endometriosis. This means your combination of symptoms creates a pattern that's often seen in endometriosis cases.

**What this means:** Your symptoms align closely with patterns commonly seen in diagnosed cases. This doesn't mean you definitely have endometriosis, but it suggests you should seek medical evaluation promptly.

**Important next steps:**
- Schedule an appointment with a gynecologist as soon as possible
- Bring your symptom tracking data to the appointment
- Don't let anyone dismiss your concerns - you know your body best

**Remember:** This is a screening tool to help guide your healthcare decisions, not a definitive diagnosis. Only a healthcare provider can properly diagnose endometriosis."""
    
    elif risk_level == "moderate" or (probability > 0.3 and probability <= 0.7):
        return f"""Your analysis shows a {probability_percent}% risk score, indicating moderate concern. Some of your symptoms align with patterns seen in endometriosis, but the picture isn't entirely clear.

**What this means:** Your symptom pattern has some features that could be associated with endometriosis, but other factors might also explain what you're experiencing.

**Recommended next steps:**
- Schedule a consultation with a gynecologist to discuss your symptoms
- Continue tracking your symptoms to identify patterns
- Discuss your family history and other risk factors with your doctor

Whether or not you have endometriosis, your symptoms deserve attention and proper medical evaluation."""
    
    else:
        return f"""Your analysis shows a {probability_percent}% risk score, which is considered lower risk. Your current symptoms don't strongly match typical endometriosis patterns, but every person's experience is unique.

**What this means:** Based on your symptom pattern, endometriosis is less likely, but this doesn't completely rule out the condition or other health concerns.

**Still important to consider:**
- Continue monitoring your symptoms over time
- Maintain regular gynecological check-ups
- Consult a healthcare provider if symptoms worsen

Trust your body and don't hesitate to advocate for your health."""

def get_fallback_recommendations(prediction_result: Dict) -> List[Dict]:
    """Generate fallback recommendations."""
    risk_level = prediction_result.get("risk_level", "Unknown").lower()
    
    base_recs = [
        {
            "category": "Self-Care",
            "action": "Continue tracking symptoms",
            "description": "Keep detailed records of pain, bleeding, and other symptoms to share with healthcare providers."
        }
    ]
    
    if risk_level == "high":
        base_recs.extend([
            {
                "category": "Medical Care",
                "action": "Schedule gynecologist appointment urgently",
                "description": "Book an appointment as soon as possible to discuss your symptoms and diagnostic options.",
                "priority": "high"
            }
        ])
    elif risk_level == "moderate":
        base_recs.extend([
            {
                "category": "Medical Care",
                "action": "Schedule gynecologist consultation",
                "description": "Make an appointment to discuss your symptoms and explore potential causes.",
                "priority": "medium"
            }
        ])
    else:
        base_recs.extend([
            {
                "category": "Monitoring",
                "action": "Continue regular check-ups",
                "description": "Maintain routine gynecological care and mention any concerning symptoms."
            }
        ])
    
    return base_recs

def get_fallback_answer(question: str, risk_level: str) -> str:
    """Generate fallback answer for specific questions."""
    lowerQuestion = question.lower()
    
    if 'next steps' in lowerQuestion or 'what should i do' in lowerQuestion:
        if risk_level.lower() == 'high':
            return "With your high risk score, I recommend scheduling an appointment with a gynecologist as soon as possible. Bring your symptom tracking data and prepare a list of questions."
        elif risk_level.lower() == 'moderate':
            return "Your moderate risk score suggests you should schedule a consultation with a gynecologist to discuss your symptoms."
        else:
            return "Continue monitoring your symptoms and maintain regular gynecological check-ups."
    
    if 'accurate' in lowerQuestion or 'accuracy' in lowerQuestion:
        return "This analysis is based on symptom patterns and machine learning, but only a healthcare professional can provide a definitive diagnosis."
    
    return "That's a great question about your health. I recommend discussing this specific concern with a healthcare provider who can give you personalized medical advice."

if __name__ == "__main__":
    # Get port from environment variable or default to 8001
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(
        "rag_api:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Disable reload in production
        log_level="info"
    )