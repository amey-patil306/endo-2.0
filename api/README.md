# Endometriosis Prediction API - Phase 2

A FastAPI-based REST API that uses your trained XGBoost model to predict endometriosis based on symptom data.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd api
pip install -r requirements.txt
```

### 2. Ensure Model is Available

Make sure your `trained_model.pkl` is in one of these locations:
- `../ML-Model/model/trained_model.pkl` (relative to api directory)
- `api/trained_model.pkl` (in the api directory)

### 3. Run the API

```bash
# Option 1: Direct Python
python predict_api.py

# Option 2: Using uvicorn
uvicorn predict_api:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

### 4. Test the API

```bash
python test_api.py
```

## 📚 API Endpoints

### Health Check
- **GET** `/` - Basic health check
- **GET** `/health` - Detailed health check with model status

### Predictions
- **POST** `/predict` - Single symptom prediction
- **POST** `/predict-multi-day` - Multi-day aggregated prediction

### Utilities
- **GET** `/symptoms/list` - List all tracked symptoms

## 🔧 API Usage Examples

### Single Prediction

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "Irregular_Missed_periods": 1,
    "Cramping": 1,
    "Pain_Chronic_pain": 1,
    "Extreme_Bloating": 1,
    "Depression": 1,
    "Ovarian_cysts": 1,
    "Menstrual_clots": 0,
    "Infertility": 0,
    "Diarrhea": 0,
    "Long_menstruation": 0,
    "Vomiting_constant_vomiting": 0,
    "Migraines": 0,
    "Leg_pain": 0,
    "Fertility_Issues": 0,
    "Painful_urination": 0,
    "Pain_after_Intercourse": 0,
    "Digestive_GI_problems": 0,
    "Anaemia_Iron_deficiency": 0,
    "Hip_pain": 0,
    "Vaginal_Pain_Pressure": 0,
    "Cysts_unspecified": 0,
    "Abnormal_uterine_bleeding": 0,
    "Hormonal_problems": 0,
    "Feeling_sick": 0,
    "Abdominal_Cramps_during_Intercourse": 0,
    "Insomnia_Sleeplessness": 0,
    "Loss_of_appetite": 0
  }'
```

### Multi-Day Prediction

```bash
curl -X POST "http://localhost:8000/predict-multi-day" \
  -H "Content-Type: application/json" \
  -d '{
    "daily_logs": [
      {
        "date": "2024-01-01",
        "symptoms": {
          "Irregular_Missed_periods": 1,
          "Cramping": 1,
          "Pain_Chronic_pain": 1,
          ...
        }
      },
      {
        "date": "2024-01-02",
        "symptoms": {
          "Cramping": 1,
          "Migraines": 1,
          ...
        }
      }
    ],
    "user_id": "user123"
  }'
```

## 📊 Response Format

```json
{
  "prediction": 1,
  "prediction_label": "Endometriosis",
  "confidence": 0.8542,
  "probabilities": {
    "no_endometriosis": 0.1458,
    "endometriosis": 0.8542
  },
  "risk_level": "High",
  "message": "The model suggests a high risk of endometriosis. Please consult with a healthcare professional for proper diagnosis."
}
```

## 🔗 Integration with Frontend

The API is CORS-enabled and ready to integrate with your React frontend. Example JavaScript:

```javascript
// Single prediction
const predictSymptoms = async (symptoms) => {
  const response = await fetch('http://localhost:8000/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(symptoms)
  });
  return response.json();
};

// Multi-day prediction
const predictMultiDay = async (dailyLogs) => {
  const response = await fetch('http://localhost:8000/predict-multi-day', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ daily_logs: dailyLogs })
  });
  return response.json();
};
```

## 🚀 Deployment Options

### Option 1: Render (Free)
1. Push your code to GitHub
2. Connect to Render
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn predict_api:app --host 0.0.0.0 --port $PORT`

### Option 2: Railway (Free)
1. Connect GitHub repo
2. Railway auto-detects Python and installs dependencies
3. Set start command: `uvicorn predict_api:app --host 0.0.0.0 --port $PORT`

### Option 3: Fly.io
1. Install flyctl
2. Run `fly launch`
3. Deploy with `fly deploy`

## 🔒 Security Notes

- In production, replace `allow_origins=["*"]` with your specific frontend domain
- Add authentication if needed
- Consider rate limiting for production use
- Validate and sanitize all inputs

## 📈 Model Performance

The API uses your trained XGBoost model with:
- SMOTE for handling class imbalance
- GridSearch for hyperparameter optimization
- 27 symptom features matching your ML model exactly

## 🐛 Troubleshooting

### Model Not Found Error
- Ensure `trained_model.pkl` is in the correct location
- Check file permissions
- Verify the model was trained and saved properly

### Import Errors
- Install all dependencies: `pip install -r requirements.txt`
- Check Python version compatibility

### CORS Issues
- Verify CORS middleware is properly configured
- Check that your frontend URL is allowed

## 📞 Support

For issues related to:
- **API functionality**: Check logs and test endpoints
- **Model predictions**: Verify input data format matches training data
- **Deployment**: Refer to platform-specific documentation