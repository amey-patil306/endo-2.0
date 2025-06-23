import pandas as pd
import joblib
import os

def load_model():
    """Load the trained model from the ML-Model directory."""
    model_path = os.path.join('..', 'ML-Model', 'model', 'trained_model.pkl')
    if not os.path.exists(model_path):
        # Try alternative path
        model_path = 'trained_model.pkl'
    return joblib.load(model_path)

def preprocess_input_data(input_data_dict):
    """Preprocess input data to match the model's expected format."""
    # Define the exact feature columns as used in your ML model
    feature_columns = [
        'Irregular / Missed periods', 'Cramping', 'Menstrual clots', 
        'Infertility', 'Pain / Chronic pain', 'Diarrhea', 
        'Long menstruation', 'Vomiting / constant vomiting', 
        'Migraines', 'Extreme Bloating', 'Leg pain', 'Depression', 
        'Fertility Issues', 'Ovarian cysts', 'Painful urination', 
        'Pain after Intercourse', 'Digestive / GI problems', 
        'Anaemia / Iron deficiency', 'Hip pain', 'Vaginal Pain/Pressure', 
        'Cysts (unspecified)', 'Abnormal uterine bleeding', 
        'Hormonal problems', 'Feeling sick', 
        'Abdominal Cramps during Intercourse', 'Insomnia / Sleeplessness', 
        'Loss of appetite'
    ]
    
    # Create DataFrame with the expected column names
    processed_data = {}
    for col in feature_columns:
        # Map from API field names to model column names
        api_key = col.replace(' / ', '_').replace(' ', '_').replace('/', '_').replace('(', '').replace(')', '')
        processed_data[col] = input_data_dict.get(api_key, 0)
    
    return pd.DataFrame([processed_data])

def predict_from_input(input_data_dict):
    """
    Make prediction from input data dictionary.
    
    Args:
        input_data_dict: Dictionary containing symptom data
        
    Returns:
        Dictionary with prediction and probability
    """
    try:
        # Load the trained model
        model = load_model()
        
        # Preprocess input data
        input_df = preprocess_input_data(input_data_dict)
        
        # Make prediction
        prediction = model.predict(input_df)[0]
        prediction_proba = model.predict_proba(input_df)[0]
        
        # Get confidence for the predicted class
        confidence = prediction_proba[int(prediction)]
        
        # Get probabilities for both classes
        no_endo_prob = prediction_proba[0]
        endo_prob = prediction_proba[1]
        
        return {
            "prediction": int(prediction),
            "prediction_label": "Endometriosis" if prediction == 1 else "No Endometriosis",
            "confidence": round(float(confidence), 4),
            "probabilities": {
                "no_endometriosis": round(float(no_endo_prob), 4),
                "endometriosis": round(float(endo_prob), 4)
            },
            "risk_level": get_risk_level(float(endo_prob))
        }
    except Exception as e:
        return {
            "error": f"Prediction failed: {str(e)}",
            "prediction": None,
            "confidence": None
        }

def get_risk_level(endo_probability):
    """Determine risk level based on endometriosis probability."""
    if endo_probability < 0.3:
        return "Low"
    elif endo_probability < 0.7:
        return "Moderate"
    else:
        return "High"

def aggregate_daily_logs(daily_logs):
    """
    Aggregate multiple daily symptom logs into a single feature vector.
    
    Args:
        daily_logs: List of daily symptom dictionaries
        
    Returns:
        Dictionary with aggregated features
    """
    if not daily_logs:
        return {}
    
    # Initialize aggregated data
    aggregated = {}
    
    # Define all possible symptom keys
    symptom_keys = [
        'Irregular_Missed_periods', 'Cramping', 'Menstrual_clots', 
        'Infertility', 'Pain_Chronic_pain', 'Diarrhea', 
        'Long_menstruation', 'Vomiting_constant_vomiting', 
        'Migraines', 'Extreme_Bloating', 'Leg_pain', 'Depression', 
        'Fertility_Issues', 'Ovarian_cysts', 'Painful_urination', 
        'Pain_after_Intercourse', 'Digestive_GI_problems', 
        'Anaemia_Iron_deficiency', 'Hip_pain', 'Vaginal_Pain_Pressure', 
        'Cysts_unspecified', 'Abnormal_uterine_bleeding', 
        'Hormonal_problems', 'Feeling_sick', 
        'Abdominal_Cramps_during_Intercourse', 'Insomnia_Sleeplessness', 
        'Loss_of_appetite'
    ]
    
    # Aggregate each symptom across all days
    for key in symptom_keys:
        # Count how many days this symptom was present
        symptom_count = sum(1 for log in daily_logs if log.get(key, False))
        # Convert to percentage of days (0-1 scale)
        aggregated[key] = symptom_count / len(daily_logs)
    
    return aggregated

# Test function for CLI usage (keeping your original functionality)
def get_user_input_cli():
    """Original CLI function for testing purposes."""
    feature_columns = [
        'Irregular / Missed periods', 'Cramping', 'Menstrual clots', 
        'Infertility', 'Pain / Chronic pain', 'Diarrhea', 
        'Long menstruation', 'Vomiting / constant vomiting', 
        'Migraines', 'Extreme Bloating', 'Leg pain', 'Depression', 
        'Fertility Issues', 'Ovarian cysts', 'Painful urination', 
        'Pain after Intercourse', 'Digestive / GI problems', 
        'Anaemia / Iron deficiency', 'Hip pain', 'Vaginal Pain/Pressure', 
        'Cysts (unspecified)', 'Abnormal uterine bleeding', 
        'Hormonal problems', 'Feeling sick', 
        'Abdominal Cramps during Intercourse', 'Insomnia / Sleeplessness', 
        'Loss of appetite'
    ]
    
    user_data = {}
    print("Please enter 0 for 'no' and 1 for 'yes' for the following symptoms:")
    for column in feature_columns:
        while True:
            try:
                val = float(input(f"Enter value for {column}: "))
                if val not in [0, 1]:
                    raise ValueError("Input must be 0 or 1.")
                user_data[column.replace(' / ', '_').replace(' ', '_').replace('/', '_').replace('(', '').replace(')', '')] = val
                break
            except ValueError as e:
                print(f"Invalid input. {e}")
    return user_data

if __name__ == "__main__":
    # CLI testing
    print("=== Endometriosis Prediction CLI ===")
    user_input = get_user_input_cli()
    result = predict_from_input(user_input)
    
    print("\n--- Diagnosis Prediction ---")
    if result.get("error"):
        print(f"Error: {result['error']}")
    else:
        print(f"Prediction: {result['prediction_label']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"Risk Level: {result['risk_level']}")
        print(f"Probabilities:")
        print(f"  No Endometriosis: {result['probabilities']['no_endometriosis']:.2%}")
        print(f"  Endometriosis: {result['probabilities']['endometriosis']:.2%}")