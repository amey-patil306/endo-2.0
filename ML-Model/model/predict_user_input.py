import pandas as pd
import joblib

def load_data(file_path):
    """Load the dataset from a CSV file."""
    return pd.read_csv(file_path)

def preprocess_data(data):
    """Preprocess the data to prepare for model input."""
    # Print the columns to understand the structure of the DataFrame
    print("Columns in the DataFrame:", data.columns)

    # Adjust the feature columns based on the actual dataset
    feature_columns = [
        'Irregular / Missed periods', 'Cramping', 'Menstrual clots', 
        'Infertility', 'Pain / Chronic pain', 'Diarrhea', 
        'Long menstruation', 'Vomiting / constant vomiting', 
        'Migraines', 'Extreme Bloating',  # Use the correct name
        'Leg pain', 'Depression', 'Fertility Issues', 'Ovarian cysts', 
        'Painful urination', 'Pain after Intercourse', 
        'Digestive / GI problems', 'Anaemia / Iron deficiency', 
        'Hip pain', 'Vaginal Pain/Pressure', 'Cysts (unspecified)', 
        'Abnormal uterine bleeding', 'Hormonal problems', 
        'Feeling sick', 'Abdominal Cramps during Intercourse', 
        'Insomnia / Sleeplessness', 'Loss of appetite'
    ]
    
    # Extract features
    X = data[feature_columns]
    return X

def get_user_input(columns):
    """Collect user input based on the expected features."""
    user_data = {}
    print("Please enter 0 for 'no' and 1 for 'yes' for the following symptoms:")
    for column in columns:
        while True:
            try:
                val = float(input(f"Enter value for {column}: "))
                if val not in [0, 1]:  # Ensure input is either 0 or 1
                    raise ValueError("Input must be 0 or 1.")
                user_data[column] = val
                break
            except ValueError as e:
                print(f"Invalid input. {e}")
    return pd.DataFrame([user_data])

if __name__ == "__main__":
    # Load the model
    model = joblib.load('trained_model.pkl')

    # Load dataset and preprocess to get column names
    data = load_data('data/structured_endometriosis.csv')
    
    # Preprocess the data
    X = preprocess_data(data)

    # Get user input
    input_df = get_user_input(X.columns)

    # Predict using trained model
    prediction = model.predict(input_df)[0]
    prediction_proba = model.predict_proba(input_df)[0][int(prediction)]

    # Output the result
    print("\n--- Diagnosis Prediction ---")
    if prediction == 1:
        print(f"The model predicts: Endometriosis (Confidence: {prediction_proba:.2f})")
    else:
        print(f"The model predicts: No Endometriosis (Confidence: {prediction_proba:.2f})")