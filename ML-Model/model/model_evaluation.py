import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import joblib  # To load the trained model
from data_preprocessing import load_data, preprocess_data
from sklearn.model_selection import train_test_split

def evaluate_model(model, X_test, y_test):
    # Make predictions
    y_pred = model.predict(X_test)

    # Calculate accuracy
    accuracy = accuracy_score(y_test, y_pred)
    print(f'Accuracy: {accuracy:.2f}')

    # Confusion matrix
    conf_matrix = confusion_matrix(y_test, y_pred)
    print('Confusion Matrix:\n', conf_matrix)

    # Classification report
    class_report = classification_report(y_test, y_pred)
    print('Classification Report:\n', class_report)

    # Visualize the confusion matrix
    plt.figure(figsize=(8, 6))
    sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues', 
             xticklabels=['No Endometriosis (0)', 'Endometriosis (1)'], 
             yticklabels=['No Endometriosis (0)', 'Endometriosis (1)'])
    plt.title('Confusion Matrix')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.show()

# Test the function
if __name__ == "__main__":
    # Load the data
    data = load_data('data\structured_endometriosis.csv')  # Adjusted path
    X, y = preprocess_data(data)

    # Load the trained model
    model = joblib.load('trained_model.pkl')  # Adjust the path as needed

    # Split the data again to get X_test and y_test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Evaluate the model
    evaluate_model(model, X_test, y_test)