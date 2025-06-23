import requests
import json

# API base URL
BASE_URL = "http://127.0.0.1:8000"

def test_health_check():
    """Test the health check endpoint."""
    print("=== Testing Health Check ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_single_prediction():
    """Test single symptom prediction."""
    print("=== Testing Single Prediction ===")
    
    # Sample symptom data (high risk case)
    sample_symptoms = {
        "Irregular_Missed_periods": 1,
        "Cramping": 1,
        "Menstrual_clots": 1,
        "Pain_Chronic_pain": 1,
        "Extreme_Bloating": 1,
        "Depression": 1,
        "Ovarian_cysts": 1,
        "Painful_urination": 1,
        "Hip_pain": 1,
        "Migraines": 1,
        # All other symptoms set to 0
        "Infertility": 0,
        "Diarrhea": 0,
        "Long_menstruation": 0,
        "Vomiting_constant_vomiting": 0,
        "Leg_pain": 0,
        "Fertility_Issues": 0,
        "Pain_after_Intercourse": 0,
        "Digestive_GI_problems": 0,
        "Anaemia_Iron_deficiency": 0,
        "Vaginal_Pain_Pressure": 0,
        "Cysts_unspecified": 0,
        "Abnormal_uterine_bleeding": 0,
        "Hormonal_problems": 0,
        "Feeling_sick": 0,
        "Abdominal_Cramps_during_Intercourse": 0,
        "Insomnia_Sleeplessness": 0,
        "Loss_of_appetite": 0
    }
    
    response = requests.post(f"{BASE_URL}/predict", json=sample_symptoms)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

def test_multi_day_prediction():
    """Test multi-day prediction."""
    print("=== Testing Multi-Day Prediction ===")
    
    # Sample multi-day data
    multi_day_data = {
        "daily_logs": [
            {
                "date": "2024-01-01",
                "symptoms": {
                    "Irregular_Missed_periods": 1,
                    "Cramping": 1,
                    "Pain_Chronic_pain": 1,
                    "Extreme_Bloating": 1,
                    # ... other symptoms set to 0
                    "Menstrual_clots": 0,
                    "Infertility": 0,
                    "Diarrhea": 0,
                    "Long_menstruation": 0,
                    "Vomiting_constant_vomiting": 0,
                    "Migraines": 0,
                    "Leg_pain": 0,
                    "Depression": 0,
                    "Fertility_Issues": 0,
                    "Ovarian_cysts": 0,
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
                }
            },
            {
                "date": "2024-01-02",
                "symptoms": {
                    "Irregular_Missed_periods": 0,
                    "Cramping": 1,
                    "Pain_Chronic_pain": 1,
                    "Migraines": 1,
                    # ... other symptoms
                    "Menstrual_clots": 0,
                    "Infertility": 0,
                    "Diarrhea": 0,
                    "Long_menstruation": 0,
                    "Vomiting_constant_vomiting": 0,
                    "Extreme_Bloating": 0,
                    "Leg_pain": 0,
                    "Depression": 0,
                    "Fertility_Issues": 0,
                    "Ovarian_cysts": 0,
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
                }
            }
        ],
        "user_id": "test_user_123"
    }
    
    response = requests.post(f"{BASE_URL}/predict-multi-day", json=multi_day_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

def test_symptoms_list():
    """Test symptoms list endpoint."""
    print("=== Testing Symptoms List ===")
    response = requests.get(f"{BASE_URL}/symptoms/list")
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Total symptoms: {result['total_count']}")
    print("First 5 symptoms:")
    for symptom in result['symptoms'][:5]:
        print(f"  - {symptom['key']}: {symptom['label']}")
    print()

if __name__ == "__main__":
    print("🧪 Testing Endometriosis Prediction API")
    print("=" * 50)
    
    try:
        test_health_check()
        test_single_prediction()
        test_multi_day_prediction()
        test_symptoms_list()
        print("✅ All tests completed!")
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to API. Make sure the server is running:")
        print("   python api/predict_api.py")
        print("   or")
        print("   uvicorn api.predict_api:app --reload")