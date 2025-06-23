import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { SymptomEntry } from '../types';
import { getSymptomEntriesForPrediction } from '../firebase/firestore';
import { dummyPredictionResults } from '../utils/dummyData';
import PredictionExplanation from './PredictionExplanation';
import { Brain, TrendingUp, Calendar, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface PredictionResult {
  prediction: number;
  prediction_label: string;
  confidence: number;
  probabilities: {
    no_endometriosis: number;
    endometriosis: number;
  };
  risk_level: string;
  message: string;
}

interface PredictionDashboardProps {
  user: User;
  completedDays: number;
}

const PredictionDashboard: React.FC<PredictionDashboardProps> = ({ user, completedDays }) => {
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingDummyData, setUsingDummyData] = useState(false);

  const canPredict = completedDays >= 5; // Minimum days for prediction

  const transformSymptomData = (entries: SymptomEntry[]) => {
    // Aggregate symptoms across all days
    const aggregated: any = {};
    const symptomKeys = [
      'irregularPeriods', 'cramping', 'menstrualClots', 'infertility', 'chronicPain',
      'diarrhea', 'longMenstruation', 'vomiting', 'migraines', 'extremeBloating',
      'legPain', 'depression', 'fertilityIssues', 'ovarianCysts', 'painfulUrination',
      'painAfterIntercourse', 'digestiveProblems', 'anemia', 'hipPain', 'vaginalPain',
      'cysts', 'abnormalBleeding', 'hormonalProblems', 'feelingSick',
      'abdominalCrampsIntercourse', 'insomnia', 'lossOfAppetite'
    ];

    // Map frontend keys to API keys
    const keyMapping: { [key: string]: string } = {
      'irregularPeriods': 'Irregular_Missed_periods',
      'cramping': 'Cramping',
      'menstrualClots': 'Menstrual_clots',
      'infertility': 'Infertility',
      'chronicPain': 'Pain_Chronic_pain',
      'diarrhea': 'Diarrhea',
      'longMenstruation': 'Long_menstruation',
      'vomiting': 'Vomiting_constant_vomiting',
      'migraines': 'Migraines',
      'extremeBloating': 'Extreme_Bloating',
      'legPain': 'Leg_pain',
      'depression': 'Depression',
      'fertilityIssues': 'Fertility_Issues',
      'ovarianCysts': 'Ovarian_cysts',
      'painfulUrination': 'Painful_urination',
      'painAfterIntercourse': 'Pain_after_Intercourse',
      'digestiveProblems': 'Digestive_GI_problems',
      'anemia': 'Anaemia_Iron_deficiency',
      'hipPain': 'Hip_pain',
      'vaginalPain': 'Vaginal_Pain_Pressure',
      'cysts': 'Cysts_unspecified',
      'abnormalBleeding': 'Abnormal_uterine_bleeding',
      'hormonalProblems': 'Hormonal_problems',
      'feelingSick': 'Feeling_sick',
      'abdominalCrampsIntercourse': 'Abdominal_Cramps_during_Intercourse',
      'insomnia': 'Insomnia_Sleeplessness',
      'lossOfAppetite': 'Loss_of_appetite'
    };

    // Calculate frequency of each symptom (0-1 scale)
    symptomKeys.forEach(key => {
      const apiKey = keyMapping[key];
      if (apiKey) {
        const count = entries.filter(entry => entry[key as keyof SymptomEntry] === true).length;
        aggregated[apiKey] = count / entries.length; // Frequency as decimal
      }
    });

    return aggregated;
  };

  const generateDummyPrediction = (entries: SymptomEntry[]): PredictionResult => {
    // Analyze symptom frequency to determine risk level
    const symptomCounts = entries.reduce((acc, entry) => {
      Object.keys(entry).forEach(key => {
        if (typeof entry[key as keyof SymptomEntry] === 'boolean' && entry[key as keyof SymptomEntry]) {
          acc[key] = (acc[key] || 0) + 1;
        }
      });
      return acc;
    }, {} as Record<string, number>);

    const totalSymptoms = Object.values(symptomCounts).reduce((sum, count) => sum + count, 0);
    const avgSymptomsPerDay = totalSymptoms / entries.length;

    // Determine risk level based on symptom frequency
    let riskLevel: 'low' | 'moderate' | 'high';
    if (avgSymptomsPerDay >= 6) {
      riskLevel = 'high';
    } else if (avgSymptomsPerDay >= 3) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'low';
    }

    return dummyPredictionResults[riskLevel];
  };

  const runPrediction = async () => {
    setLoading(true);
    setError(null);
    setUsingDummyData(false);

    try {
      // Get user's symptom entries
      const entries = await getSymptomEntriesForPrediction(user.uid);
      
      if (entries.length === 0) {
        throw new Error('No symptom data found. Please log some symptoms first.');
      }

      // Try to call the real API first
      try {
        const transformedData = transformSymptomData(entries);
        const response = await fetch('http://localhost:8000/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transformedData)
        });

        if (response.ok) {
          const result = await response.json();
          setPredictionResult(result);
          toast.success('Prediction completed successfully!');
          return;
        }
      } catch (apiError) {
        console.warn('API not available, using dummy prediction:', apiError);
      }

      // Fallback to dummy prediction
      const dummyResult = generateDummyPrediction(entries);
      setPredictionResult(dummyResult);
      setUsingDummyData(true);
      toast.success('Demo prediction generated! (API not available)');

    } catch (err: any) {
      console.error('Prediction error:', err);
      setError(err.message || 'Failed to generate prediction');
      toast.error('Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return <AlertCircle className="h-6 w-6" />;
      case 'moderate': return <TrendingUp className="h-6 w-6" />;
      case 'low': return <CheckCircle className="h-6 w-6" />;
      default: return <Brain className="h-6 w-6" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-primary-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              AI Prediction Analysis
            </h2>
            <p className="text-sm text-gray-600">
              Get insights based on your symptom patterns
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{completedDays} days tracked</span>
        </div>
      </div>

      {!canPredict && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-blue-800 font-medium">More data needed</p>
              <p className="text-blue-700 text-sm">
                Track at least 5 days of symptoms to generate a prediction. 
                You currently have {completedDays} days logged.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {usingDummyData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <WifiOff className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-yellow-800 font-medium">Demo Mode</p>
              <p className="text-yellow-700 text-sm">
                Using simulated prediction results. The ML API is not available.
              </p>
            </div>
          </div>
        </div>
      )}

      {!predictionResult && canPredict && (
        <div className="text-center py-8">
          <Brain className="h-16 w-16 text-primary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready for AI Analysis
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Our machine learning model will analyze your symptom patterns 
            to provide insights about potential endometriosis risk.
          </p>
          <button
            onClick={runPrediction}
            disabled={loading || !canPredict}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Prediction
              </>
            )}
          </button>
        </div>
      )}

      {predictionResult && (
        <div className="space-y-6">
          {/* Prediction Result Card */}
          <div className={`rounded-lg border p-6 ${getRiskColor(predictionResult.risk_level)}`}>
            <div className="flex items-center space-x-4 mb-4">
              {getRiskIcon(predictionResult.risk_level)}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {predictionResult.prediction_label}
                </h3>
                <p className="text-sm opacity-90">
                  {predictionResult.risk_level} Risk Level
                  {usingDummyData && <span className="ml-2">(Demo)</span>}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {Math.round(predictionResult.probabilities.endometriosis * 100)}%
                </div>
                <div className="text-xs opacity-75">
                  Probability
                </div>
              </div>
            </div>
            
            <p className="text-sm mb-4">{predictionResult.message}</p>
            
            {/* Probability Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Endometriosis</span>
                <span>{Math.round(predictionResult.probabilities.endometriosis * 100)}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                <div 
                  className="bg-current h-2 rounded-full transition-all duration-300"
                  style={{ width: `${predictionResult.probabilities.endometriosis * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span>No Endometriosis</span>
                <span>{Math.round(predictionResult.probabilities.no_endometriosis * 100)}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                <div 
                  className="bg-current h-2 rounded-full transition-all duration-300"
                  style={{ width: `${predictionResult.probabilities.no_endometriosis * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setShowExplanation(true)}
              className="flex-1 btn-primary"
            >
              <Brain className="h-4 w-4 mr-2" />
              Get AI Explanation
            </button>
            <button
              onClick={runPrediction}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? 'Updating...' : 'Update Prediction'}
            </button>
          </div>

          {/* Important Disclaimer */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Important Disclaimer</h4>
            <p className="text-sm text-gray-600">
              This prediction is based on machine learning analysis of symptom patterns 
              and is for informational purposes only. It does not constitute medical advice 
              or diagnosis. Please consult with a healthcare professional for proper 
              medical evaluation and diagnosis.
            </p>
          </div>
        </div>
      )}

      {/* Explanation Modal */}
      {showExplanation && predictionResult && (
        <PredictionExplanation
          predictionResult={predictionResult}
          onClose={() => setShowExplanation(false)}
        />
      )}
    </div>
  );
};

export default PredictionDashboard;