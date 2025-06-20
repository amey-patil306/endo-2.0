# src/data_preprocessing.py

import pandas as pd

def load_data(file_path):
    data = pd.read_csv(file_path)  # Use the provided file_path
    data.columns = data.columns.str.strip()  # Remove leading/trailing spaces
    return data

def preprocess_data(data):
    """Preprocess the data: handle missing values and split features and target."""
    if data.isnull().sum().any():
        data = data.fillna(0)  # Fill missing values with 0

    print("Columns in the DataFrame:", data.columns)  # Print the columns

    # Drop the 'Label' column if it exists
    if 'Label' in data.columns:
        data = data.drop(columns=['Label'])

    # Check the unique values in the 'Diagnosis' column
    print(data['Diagnosis'].value_counts())

    # Define features and target
    X = data.drop(columns=['Diagnosis'])  # Features
    y = data['Diagnosis']  # Target variable
    return X, y

# Test the functions
if __name__ == "__main__":
    data = load_data('data\structured_endometriosis.csv')  # Adjusted path
    print("Data loaded successfully.")
    print("DataFrame head:\n", data.head())  # Print the first few rows of the DataFrame
    X, y = preprocess_data(data)
    print("Features shape:", X.shape)
    print("Target shape:", y.shape)