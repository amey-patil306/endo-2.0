import React, { useState } from 'react';
import { MessageCircle, Heart, AlertCircle, CheckCircle, Clock, Sparkles, HelpCircle } from 'lucide-react';

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

interface Recommendation {
  category: string;
  action: string;
  description: string;
  priority?: string;
}

interface ExplanationResponse {
  explanation: string;
  recommendations: Recommendation[];
  risk_level: string;
  confidence: number;
  prediction_summary: {
    label: string;
    probability: number;
    risk_level: string;
  };
}

interface PredictionExplanationProps {
  predictionResult: PredictionResult;
  onClose: () => void;
}

const PredictionExplanation: React.FC<PredictionExplanationProps> = ({ 
  predictionResult, 
  onClose 
}) => {
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return <AlertCircle className="h-5 w-5" />;
      case 'moderate': return <Clock className="h-5 w-5" />;
      case 'low': return <CheckCircle className="h-5 w-5" />;
      default: return <MessageCircle className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getExplanation = async (query: string = '') => {
    setLoading(true);
    setError(null);

    const defaultQuery = query || `What does my ${Math.round(predictionResult.probabilities.endometriosis * 100)}% risk score mean? What should I do next?`;

    try {
      // Try to call the explanation API
      const response = await fetch('http://localhost:8001/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_query: defaultQuery,
          prediction_result: predictionResult,
          use_fallback: false
        })
      });

      if (!response.ok) {
        throw new Error(`Explanation service unavailable`);
      }

      const result = await response.json();
      setExplanation(result);
    } catch (err) {
      console.error('Error getting explanation:', err);
      setError('Unable to generate detailed explanation at the moment.');
      
      // Use fallback explanation
      setExplanation({
        explanation: getFallbackExplanation(predictionResult.risk_level),
        recommendations: getFallbackRecommendations(predictionResult.risk_level),
        risk_level: predictionResult.risk_level,
        confidence: predictionResult.confidence,
        prediction_summary: {
          label: predictionResult.prediction_label,
          probability: predictionResult.probabilities.endometriosis,
          risk_level: predictionResult.risk_level
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async (question: string) => {
    if (!question.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8001/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          prediction_result: predictionResult
        })
      });

      if (!response.ok) {
        throw new Error(`Question service unavailable`);
      }

      const result = await response.json();
      
      // Update explanation with the new answer
      if (explanation) {
        setExplanation({
          ...explanation,
          explanation: result.answer
        });
      }
      
      setUserQuery('');
    } catch (err) {
      console.error('Error asking question:', err);
      setError('Unable to get answer at the moment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getFallbackExplanation = (riskLevel: string): string => {
    const probability = Math.round(predictionResult.probabilities.endometriosis * 100);
    
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return `Your symptom pattern analysis shows a ${probability}% risk score, which indicates a higher likelihood that your symptoms may be related to endometriosis. This means your combination of symptoms - particularly pain patterns, menstrual irregularities, and other factors - creates a pattern that's often seen in endometriosis cases. It's important to schedule an appointment with a gynecologist as soon as possible to discuss your symptoms and explore diagnostic options. Remember, this is a screening tool to help guide your healthcare decisions, not a definitive diagnosis.`;
      
      case 'moderate':
        return `Your analysis shows a ${probability}% risk score, indicating moderate concern. Some of your symptoms align with patterns seen in endometriosis, but the picture isn't entirely clear. This suggests you should schedule a consultation with a gynecologist to discuss your symptoms and explore potential causes. Continue tracking your symptoms to identify patterns that can help your healthcare provider make the best recommendations for you.`;
      
      case 'low':
        return `Your analysis shows a ${probability}% risk score, which is considered lower risk. Your current symptoms don't strongly match typical endometriosis patterns, but every person's experience is unique. Continue monitoring your symptoms and maintain regular gynecological check-ups. If symptoms worsen or new symptoms develop, don't hesitate to consult a healthcare provider.`;
      
      default:
        return `Based on your symptom analysis, you have a ${probability}% risk score. Please consult with a healthcare professional to discuss your symptoms and determine the best course of action for your specific situation.`;
    }
  };

  const getFallbackRecommendations = (riskLevel: string): Recommendation[] => {
    const baseRecs = [
      {
        category: "Self-Care",
        action: "Continue tracking symptoms",
        description: "Keep detailed records of pain, bleeding, and other symptoms to share with healthcare providers."
      }
    ];

    if (riskLevel.toLowerCase() === 'high') {
      return [
        ...baseRecs,
        {
          category: "Medical Care",
          action: "Schedule gynecologist appointment urgently",
          description: "Book an appointment as soon as possible to discuss your symptoms and diagnostic options.",
          priority: "high"
        },
        {
          category: "Preparation",
          action: "Prepare for medical appointment",
          description: "Gather your symptom records, family history, and list of questions for your doctor.",
          priority: "high"
        }
      ];
    } else if (riskLevel.toLowerCase() === 'moderate') {
      return [
        ...baseRecs,
        {
          category: "Medical Care",
          action: "Schedule gynecologist consultation",
          description: "Make an appointment to discuss your symptoms and explore potential causes.",
          priority: "medium"
        }
      ];
    } else {
      return [
        ...baseRecs,
        {
          category: "Monitoring",
          action: "Continue regular check-ups",
          description: "Maintain routine gynecological care and mention any concerning symptoms."
        }
      ];
    }
  };

  const handleAskQuestion = async () => {
    if (!userQuery.trim()) return;
    await askQuestion(userQuery);
  };

  const commonQuestions = [
    "What are the next steps I should take?",
    "How accurate is this analysis?",
    "What symptoms are most concerning?",
    "When should I see a doctor?",
    "What treatment options are available?"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-8 w-8 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Detailed Health Insights
              </h2>
              <p className="text-sm text-gray-600">
                Personalized explanation of your analysis results
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Analysis Summary */}
          <div className={`rounded-lg border p-4 mb-6 ${getRiskColor(predictionResult.risk_level)}`}>
            <div className="flex items-center space-x-3 mb-3">
              {getRiskIcon(predictionResult.risk_level)}
              <div>
                <h3 className="font-semibold">
                  {predictionResult.risk_level} Risk Level
                </h3>
                <p className="text-sm">
                  {Math.round(predictionResult.probabilities.endometriosis * 100)}% risk score
                </p>
              </div>
            </div>
            <p className="text-sm">{predictionResult.message}</p>
          </div>

          {/* Get Explanation Section */}
          {!explanation && !loading && (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-primary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Get Personalized Explanation
              </h3>
              <p className="text-gray-600 mb-6">
                Get detailed, easy-to-understand explanations of your results
                and personalized recommendations for next steps.
              </p>
              <button
                onClick={() => getExplanation()}
                className="btn-primary"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Get Detailed Explanation
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Generating your personalized explanation...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Explanation Results */}
          {explanation && (
            <div className="space-y-6">
              {/* Detailed Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Your Personalized Explanation
                </h3>
                <div className="prose prose-blue max-w-none">
                  <p className="text-blue-800 leading-relaxed whitespace-pre-line">
                    {explanation.explanation}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Recommended Next Steps
                </h3>
                <div className="grid gap-4">
                  {explanation.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {rec.action}
                          </span>
                          {rec.priority && (
                            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(rec.priority)}`}>
                              {rec.priority} priority
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {rec.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ask Questions Section */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-3 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Have More Questions?
                </h4>
                
                {/* Common Questions */}
                <div className="mb-4">
                  <p className="text-sm text-purple-700 mb-2">Quick questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => askQuestion(question)}
                        disabled={loading}
                        className="text-xs bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Question */}
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Ask your own question..."
                    className="flex-1 input-field text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                  />
                  <button
                    onClick={handleAskQuestion}
                    disabled={!userQuery.trim() || loading}
                    className="btn-primary disabled:opacity-50 text-sm px-4 py-2"
                  >
                    Ask
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              This explanation is for educational purposes only and does not replace professional medical advice.
            </p>
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionExplanation;