from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uvicorn
import os
from predict_user_input import predict_from_input, aggregate_daily_logs

app = FastAPI(
    title="Endometriosis Prediction API",
    description="ML-powered API for predicting endometriosis based on symptom data",
    version="1.0.0"
)

# Add CORS middleware to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SymptomInput(BaseModel):
    """Single symptom input model matching your ML model features."""
    Irregular_Missed_periods: float = Field(0, ge=0, le=1, description="Irregular/Missed periods (0 or 1)")
    Cramping: float = Field(0, ge=0, le=1, description="Cramping (0 or 1)")
    Menstrual_clots: float = Field(0, ge=0, le=1, description="Menstrual clots (0 or 1)")
    Infertility: float = Field(0, ge=0, le=1, description="Infertility (0 or 1)")
    Pain_Chronic_pain: float = Field(0, ge=0, le=1, description="Pain/Chronic pain (0 or 1)")
    Diarrhea: float = Field(0, ge=0, le=1, description="Diarrhea (0 or 1)")
    Long_menstruation: float = Field(0, ge=0, le=1, description="Long menstruation (0 or 1)")
    Vomiting_constant_vomiting: float = Field(0, ge=0, le=1, description="Vomiting/constant vomiting (0 or 1)")
    Migraines: float = Field(0, ge=0, le=1, description="Migraines (0 or 1)")
    Extreme_Bloating: float = Field(0, ge=0, le=1, description="Extreme Bloating (0 or 1)")
    Leg_pain: float = Field(0, ge=0, le=1, description="Leg pain (0 or 1)")
    Depression: float = Field(0, ge=0, le=1, description="Depression (0 or 1)")
    Fertility_Issues: float = Field(0, ge=0, le=1, description="Fertility Issues (0 or 1)")
    Ovarian_cysts: float = Field(0, ge=0, le=1, description="Ovarian cysts (0 or 1)")
    Painful_urination: float = Field(0, ge=0, le=1, description="Painful urination (0 or 1)")
    Pain_after_Intercourse: float = Field(0, ge=0, le=1, description="Pain after Intercourse (0 or 1)")
    Digestive_GI_problems: float = Field(0, ge=0, le=1, description="Digestive/GI problems (0 or 1)")
    Anaemia_Iron_deficiency: float = Field(0, ge=0, le=1, description="Anaemia/Iron deficiency (0 or 1)")
    Hip_pain: float = Field(0, ge=0, le=1, description="Hip pain (0 or 1)")
    Vaginal_Pain_Pressure: float = Field(0, ge=0, le=1, description="Vaginal Pain/Pressure (0 or 1)")
    Cysts_unspecified: float = Field(0, ge=0, le=1, description="Cysts (unspecified) (0 or 1)")
    Abnormal_uterine_bleeding: float = Field(0, ge=0, le=1, description="Abnormal uterine bleeding (0 or 1)")
    Hormonal_problems: float = Field(0, ge=0, le=1, description="Hormonal problems (0 or 1)")
    Feeling_sick: float = Field(0, ge=0, le=1, description="Feeling sick (0 or 1)")
    Abdominal_Cramps_during_Intercourse: float = Field(0, ge=0, le=1, description="Abdominal Cramps during Intercourse (0 or 1)")
    Insomnia_Sleeplessness: float = Field(0, ge=0, le=1, description="Insomnia/Sleeplessness (0 or 1)")
    Loss_of_appetite: float = Field(0, ge=0, le=1, description="Loss of appetite (0 or 1)")

class DailyLogInput(BaseModel):
    """Daily symptom log input model."""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    symptoms: SymptomInput

class MultiDayInput(BaseModel):
    """Multiple daily logs input model."""
    daily_logs: List[DailyLogInput] = Field(..., description="List of daily symptom logs")
    user_id: Optional[str] = Field(None, description="Optional user identifier")

class PredictionResponse(BaseModel):
    """Prediction response model."""
    prediction: int
    prediction_label: str
    confidence: float
    probabilities: Dict[str, float]
    risk_level: str
    message: str

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "Endometriosis Prediction API",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check."""
    try:
        # Try to load the model to ensure it's working
        from predict_user_input import load_model
        model = load_model()
        return {
            "status": "healthy",
            "model_loaded": True,
            "api_version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "model_loaded": False,
            "error": str(e)
        }

@app.post("/predict", response_model=PredictionResponse)
async def predict_single(symptoms: SymptomInput):
    """
    Make a prediction based on a single symptom input.
    
    This endpoint accepts a single set of symptoms and returns a prediction.
    """
    try:
        # Convert Pydantic model to dictionary
        symptom_data = symptoms.dict()
        
        # Make prediction
        result = predict_from_input(symptom_data)
        
        if result.get("error"):
            raise HTTPException(status_code=500, detail=result["error"])
        
        # Add interpretive message
        if result["prediction"] == 1:
            message = f"The model suggests a {result['risk_level'].lower()} risk of endometriosis. Please consult with a healthcare professional for proper diagnosis."
        else:
            message = "The model suggests a low likelihood of endometriosis based on the provided symptoms. However, please consult with a healthcare professional if you have concerns."
        
        return PredictionResponse(
            prediction=result["prediction"],
            prediction_label=result["prediction_label"],
            confidence=result["confidence"],
            probabilities=result["probabilities"],
            risk_level=result["risk_level"],
            message=message
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict-multi-day", response_model=PredictionResponse)
async def predict_multi_day(input_data: MultiDayInput):
    """
    Make a prediction based on multiple daily symptom logs.
    
    This endpoint aggregates symptoms from multiple days and returns a prediction.
    Useful for analyzing patterns over a 15-20 day period.
    """
    try:
        if len(input_data.daily_logs) == 0:
            raise HTTPException(status_code=400, detail="At least one daily log is required")
        
        # Extract symptom data from daily logs
        daily_symptoms = [log.symptoms.dict() for log in input_data.daily_logs]
        
        # Aggregate the daily logs
        aggregated_symptoms = aggregate_daily_logs(daily_symptoms)
        
        # Make prediction on aggregated data
        result = predict_from_input(aggregated_symptoms)
        
        if result.get("error"):
            raise HTTPException(status_code=500, detail=result["error"])
        
        # Add interpretive message with day count
        day_count = len(input_data.daily_logs)
        if result["prediction"] == 1:
            message = f"Based on {day_count} days of symptom tracking, the model suggests a {result['risk_level'].lower()} risk of endometriosis. Please consult with a healthcare professional for proper diagnosis."
        else:
            message = f"Based on {day_count} days of symptom tracking, the model suggests a low likelihood of endometriosis. However, please consult with a healthcare professional if you have concerns."
        
        return PredictionResponse(
            prediction=result["prediction"],
            prediction_label=result["prediction_label"],
            confidence=result["confidence"],
            probabilities=result["probabilities"],
            risk_level=result["risk_level"],
            message=message
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multi-day prediction failed: {str(e)}")

@app.get("/symptoms/list")
async def list_symptoms():
    """
    Get a list of all symptoms tracked by the model.
    
    Useful for frontend applications to know what data to collect.
    """
    symptoms = [
        {"key": "Irregular_Missed_periods", "label": "Irregular / Missed periods"},
        {"key": "Cramping", "label": "Cramping"},
        {"key": "Menstrual_clots", "label": "Menstrual clots"},
        {"key": "Infertility", "label": "Infertility"},
        {"key": "Pain_Chronic_pain", "label": "Pain / Chronic pain"},
        {"key": "Diarrhea", "label": "Diarrhea"},
        {"key": "Long_menstruation", "label": "Long menstruation"},
        {"key": "Vomiting_constant_vomiting", "label": "Vomiting / constant vomiting"},
        {"key": "Migraines", "label": "Migraines"},
        {"key": "Extreme_Bloating", "label": "Extreme Bloating"},
        {"key": "Leg_pain", "label": "Leg pain"},
        {"key": "Depression", "label": "Depression"},
        {"key": "Fertility_Issues", "label": "Fertility Issues"},
        {"key": "Ovarian_cysts", "label": "Ovarian cysts"},
        {"key": "Painful_urination", "label": "Painful urination"},
        {"key": "Pain_after_Intercourse", "label": "Pain after Intercourse"},
        {"key": "Digestive_GI_problems", "label": "Digestive / GI problems"},
        {"key": "Anaemia_Iron_deficiency", "label": "Anaemia / Iron deficiency"},
        {"key": "Hip_pain", "label": "Hip pain"},
        {"key": "Vaginal_Pain_Pressure", "label": "Vaginal Pain/Pressure"},
        {"key": "Cysts_unspecified", "label": "Cysts (unspecified)"},
        {"key": "Abnormal_uterine_bleeding", "label": "Abnormal uterine bleeding"},
        {"key": "Hormonal_problems", "label": "Hormonal problems"},
        {"key": "Feeling_sick", "label": "Feeling sick"},
        {"key": "Abdominal_Cramps_during_Intercourse", "label": "Abdominal Cramps during Intercourse"},
        {"key": "Insomnia_Sleeplessness", "label": "Insomnia / Sleeplessness"},
        {"key": "Loss_of_appetite", "label": "Loss of appetite"}
    ]
    
    return {
        "symptoms": symptoms,
        "total_count": len(symptoms),
        "description": "All symptoms tracked by the endometriosis prediction model"
    }

if __name__ == "__main__":
    # Get port from environment variable or default to 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "predict_api:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Disable reload in production
        log_level="info"
    )