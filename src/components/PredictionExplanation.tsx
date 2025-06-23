import React, { useState } from 'react';
import { MessageCircle, Heart, AlertCircle, CheckCircle, Clock, Sparkles, HelpCircle, Wifi, WifiOff } from 'lucide-react';
import { getRAGApiUrl } from '../config/api';

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
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [questionHistory, setQuestionHistory] = useState<Array<{question: string, answer: string}>>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');

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

  // Check if RAG API is available
  const checkApiAvailability = async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking RAG API availability...');
      const response = await fetch(`${getRAGApiUrl()}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      const isAvailable = response.ok;
      console.log(`🌐 RAG API availability: ${isAvailable ? 'Available' : 'Unavailable'}`);
      setApiAvailable(isAvailable);
      return isAvailable;
    } catch (error) {
      console.warn('⚠️ RAG API not available:', error);
      setApiAvailable(false);
      return false;
    }
  };

  const getExplanation = async (query: string = '') => {
    setLoading(true);
    setError(null);

    const defaultQuery = query || `What does my ${Math.round(predictionResult.probabilities.endometriosis * 100)}% risk score mean? What should I do next?`;

    console.log('🚀 Starting explanation generation...');
    console.log('📝 Query:', defaultQuery);
    console.log('📊 Prediction result:', predictionResult);

    try {
      // Check API availability first
      const isApiAvailable = await checkApiAvailability();
      
      if (!isApiAvailable) {
        console.log('⚠️ API not available, using fallback explanation');
        throw new Error('RAG API not available');
      }

      console.log('📡 Calling RAG API for explanation...');
      
      // Try to call the explanation API
      const response = await fetch(`${getRAGApiUrl()}/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_query: defaultQuery,
          prediction_result: predictionResult,
          use_fallback: false
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      console.log('📡 RAG API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ RAG API error response:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ RAG API response received:', result);

      if (!result.explanation) {
        console.warn('⚠️ No explanation in response, using fallback');
        throw new Error('No explanation received from API');
      }

      setExplanation(result);
      setApiAvailable(true);
      console.log('🎉 Explanation set successfully!');

    } catch (err: any) {
      console.error('❌ Error getting explanation:', err);
      
      // Set specific error messages
      if (err.name === 'AbortError' || err.message.includes('timeout')) {
        setError('Request timed out. The explanation service is taking too long to respond.');
      } else if (err.message.includes('fetch')) {
        setError('Cannot connect to explanation service. Please make sure the RAG API is running.');
      } else {
        setError(`Explanation service error: ${err.message}`);
      }
      
      // Use fallback explanation
      console.log('🔄 Using fallback explanation...');
      const fallbackExplanation = {
        explanation: getFallbackExplanation(predictionResult.risk_level),
        recommendations: getFallbackRecommendations(predictionResult.risk_level),
        risk_level: predictionResult.risk_level,
        confidence: predictionResult.confidence,
        prediction_summary: {
          label: predictionResult.prediction_label,
          probability: predictionResult.probabilities.endometriosis,
          risk_level: predictionResult.risk_level
        }
      };
      
      setExplanation(fallbackExplanation);
      setApiAvailable(false);
      console.log('✅ Fallback explanation set');
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async (question: string) => {
    if (!question.trim()) return;
    
    setLoading(true);
    setError(null);
    setCurrentAnswer(''); // Clear previous answer

    console.log('❓ Asking question:', question);

    try {
      // Check API availability first
      const isApiAvailable = await checkApiAvailability();
      
      if (!isApiAvailable) {
        console.log('⚠️ API not available, using fallback answer');
        throw new Error('RAG API not available for questions');
      }

      console.log('📡 Calling RAG API for question...');

      const response = await fetch(`${getRAGApiUrl()}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          prediction_result: predictionResult
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      console.log('📡 Question API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Question API error:', errorText);
        throw new Error(`Question API failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Question response received:', result);
      
      // Set the current answer to display
      if (result.answer && result.answer.trim()) {
        setCurrentAnswer(result.answer);
        
        // Add to question history
        const newQA = { question, answer: result.answer };
        setQuestionHistory(prev => [...prev, newQA]);
        
        console.log('🔄 Added question and answer to history');
        console.log('📝 Current answer set:', result.answer);
      } else {
        throw new Error('No answer received from API');
      }
      
      setUserQuery('');
      setApiAvailable(true);

    } catch (err: any) {
      console.error('❌ Error asking question:', err);
      
      // Generate fallback answer
      const fallbackAnswer = getFallbackAnswer(question, predictionResult.risk_level);
      setCurrentAnswer(fallbackAnswer);
      
      const newQA = { question, answer: fallbackAnswer };
      setQuestionHistory(prev => [...prev, newQA]);
      
      console.log('🔄 Used fallback answer for question');
      console.log('📝 Fallback answer set:', fallbackAnswer);
      setUserQuery('');
      setApiAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackAnswer = (question: string, riskLevel: string): string => {
    const lowerQuestion = question.toLowerCase();
    const probability = Math.round(predictionResult.probabilities.endometriosis * 100);
    
    if (lowerQuestion.includes('next steps') || lowerQuestion.includes('what should i do')) {
      if (riskLevel.toLowerCase() === 'high') {
        return `With your ${probability}% risk score, I recommend scheduling an appointment with a gynecologist as soon as possible. Bring your symptom tracking data and prepare a list of questions. Don't let anyone dismiss your concerns - you know your body best.`;
      } else if (riskLevel.toLowerCase() === 'moderate') {
        return `Your ${probability}% risk score suggests you should schedule a consultation with a gynecologist to discuss your symptoms. Continue tracking your symptoms and consider discussing your family history with your doctor.`;
      } else {
        return `With your ${probability}% risk score, continue monitoring your symptoms and maintain regular gynecological check-ups. If symptoms worsen or new symptoms develop, don't hesitate to consult a healthcare provider.`;
      }
    }
    
    if (lowerQuestion.includes('accurate') || lowerQuestion.includes('accuracy')) {
      return `This analysis is based on symptom patterns and machine learning, but it's important to understand that only a healthcare professional can provide a definitive diagnosis. The tool is designed to help you understand when to seek medical care and what information to share with your doctor.`;
    }
    
    if (lowerQuestion.includes('concerning') || lowerQuestion.includes('symptoms')) {
      return `The most concerning symptoms that warrant medical attention include severe pelvic pain that interferes with daily activities, heavy or irregular bleeding, pain during intercourse, and persistent digestive issues. Any combination of these symptoms, especially if they're getting worse, should be evaluated by a healthcare provider.`;
    }
    
    if (lowerQuestion.includes('doctor') || lowerQuestion.includes('see')) {
      if (riskLevel.toLowerCase() === 'high') {
        return `You should see a doctor as soon as possible, ideally within the next few weeks. Look for a gynecologist who has experience with endometriosis and pelvic pain. Don't delay if your symptoms are severe or getting worse.`;
      } else {
        return `Consider scheduling an appointment with a gynecologist within the next few months, or sooner if your symptoms worsen. Regular check-ups are important for monitoring your reproductive health.`;
      }
    }
    
    if (lowerQuestion.includes('treatment') || lowerQuestion.includes('options')) {
      return `Treatment options for endometriosis vary depending on severity and symptoms. They can include pain management with medications, hormonal therapies like birth control pills, and in some cases, surgical options. The best treatment plan depends on your specific situation, symptoms, and goals, which is why it's important to work with a healthcare provider.`;
    }
    
    // Default response
    return `That's a great question about your health. With your ${probability}% risk score, I recommend discussing this specific concern with a healthcare provider who can give you personalized medical advice based on your complete health history and a thorough examination.`;
  };

  const getFallbackExplanation = (riskLevel: string): string => {
    const probability = Math.round(predictionResult.probabilities.endometriosis * 100);
    
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return `Your symptom pattern analysis shows a ${probability}% risk score, which indicates a higher likelihood that your symptoms may be related to endometriosis. This means your combination of symptoms - particularly pain patterns, menstrual irregularities, and other factors - creates a pattern that's often seen in endometriosis cases.\n\nIt's important to schedule an appointment with a gynecologist as soon as possible to discuss your symptoms and explore diagnostic options. Remember, this is a screening tool to help guide your healthcare decisions, not a definitive diagnosis.\n\nMany effective treatments are available, and early intervention often leads to better outcomes. You're taking an important step by tracking your symptoms and seeking information.`;
      
      case 'moderate':
        return `Your analysis shows a ${probability}% risk score, indicating moderate concern. Some of your symptoms align with patterns seen in endometriosis, but the picture isn't entirely clear.\n\nThis suggests you should schedule a consultation with a gynecologist to discuss your symptoms and explore potential causes. Continue tracking your symptoms to identify patterns that can help your healthcare provider make the best recommendations for you.\n\nWhether or not you have endometriosis, your symptoms deserve attention and proper medical evaluation.`;
      
      case 'low':
        return `Your analysis shows a ${probability}% risk score, which is considered lower risk. Your current symptoms don't strongly match typical endometriosis patterns, but every person's experience is unique.\n\nContinue monitoring your symptoms and maintain regular gynecological check-ups. If symptoms worsen or new symptoms develop, don't hesitate to consult a healthcare provider.\n\nTrust your body and don't hesitate to advocate for your health.`;
      
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
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">
                  Personalized explanation of your analysis results
                </p>
                {apiAvailable !== null && (
                  <div className="flex items-center space-x-1">
                    {apiAvailable ? (
                      <Wifi className="h-3 w-3 text-green-600" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs ${apiAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {apiAvailable ? 'AI Connected' : 'AI Offline'}
                    </span>
                  </div>
                )}
              </div>
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

          {/* API Status */}
          {apiAvailable === false && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <WifiOff className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-yellow-800 font-medium">AI Explanation Service Offline</p>
                  <p className="text-yellow-700 text-sm">
                    The advanced AI explanation service is not available. Make sure the RAG API is running.
                    Using built-in explanations instead.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                Generate Detailed Explanation
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {apiAvailable === false 
                  ? 'Generating explanation using built-in knowledge...' 
                  : 'Generating your personalized AI explanation...'
                }
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-red-800 font-medium">Service Issue</p>
                  <p className="text-red-700 text-sm">{error}</p>
                  <p className="text-red-600 text-xs mt-1">
                    To enable AI explanations, make sure the RAG API server is running.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Explanation Results */}
          {explanation && (
            <div className="space-y-6">
              {/* Service Status Indicator */}
              <div className={`rounded-lg border p-3 ${apiAvailable ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  {apiAvailable ? (
                    <Wifi className="h-4 w-4 text-green-600" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-gray-600" />
                  )}
                  <span className={`text-sm font-medium ${apiAvailable ? 'text-green-800' : 'text-gray-800'}`}>
                    {apiAvailable ? 'AI-Powered Explanation' : 'Built-in Explanation'}
                  </span>
                  <span className={`text-xs ${apiAvailable ? 'text-green-600' : 'text-gray-600'}`}>
                    {apiAvailable ? 'Generated using advanced AI' : 'Using medical knowledge base'}
                  </span>
                </div>
              </div>

              {/* Detailed Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Your Personalized Explanation
                </h3>
                <div className="prose prose-blue max-w-none">
                  <div className="text-blue-800 leading-relaxed whitespace-pre-line">
                    {explanation.explanation}
                  </div>
                </div>
              </div>

              {/* Ask Questions Section */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-3 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Ask Follow-up Questions
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
                    {loading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    ) : (
                      'Ask'
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-purple-600 mt-2">
                  {apiAvailable ? 
                    'Powered by DeepSeek AI for accurate medical information' : 
                    'Using built-in medical knowledge base'
                  }
                </p>
              </div>

              {/* Current Answer Display - This is the key fix! */}
              {currentAnswer && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900 mb-2">Latest Answer</h4>
                      <div className="text-green-800 text-sm leading-relaxed whitespace-pre-line">
                        {currentAnswer}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Question History */}
              {questionHistory.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-purple-600" />
                    Your Questions & Answers ({questionHistory.length})
                  </h3>
                  <div className="space-y-3">
                    {questionHistory.slice().reverse().map((qa, index) => (
                      <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="mb-2">
                          <span className="text-sm font-medium text-purple-900">Q: </span>
                          <span className="text-sm text-purple-800">{qa.question}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-purple-900">A: </span>
                          <span className="text-sm text-purple-700 whitespace-pre-line">{qa.answer}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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