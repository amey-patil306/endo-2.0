import logging
from typing import Dict, List, Optional
from vector_store import MedicalKnowledgeVectorStore
from together_client import TogetherLlamaClient

logger = logging.getLogger(__name__)

class EndometriosisExplanationService:
    def __init__(self):
        """Initialize the explanation service with vector store and Together API client."""
        self.vector_store = MedicalKnowledgeVectorStore()
        self.vector_store.create_vectorstore()
        
        # Use the Together API client with DeepSeek-V3
        self.llama_client = TogetherLlamaClient()
        
        logger.info("🎯 Explanation service initialized with Together API (DeepSeek-V3)")
        
    def generate_explanation(self, 
                           user_query: str, 
                           prediction_result: Dict,
                           use_fallback: bool = False) -> Dict:
        """
        Generate comprehensive explanation for endometriosis prediction.
        """
        try:
            # Extract key information from prediction
            risk_level = prediction_result.get('risk_level', 'Unknown').lower()
            prediction_label = prediction_result.get('prediction_label', 'Unknown')
            confidence = prediction_result.get('confidence', 0)
            endo_probability = prediction_result.get('probabilities', {}).get('endometriosis', 0)
            
            logger.info(f"🎯 Generating explanation for {risk_level} risk level")
            logger.info(f"📊 Probability: {endo_probability:.1%}")
            logger.info(f"❓ User query: {user_query}")
            
            # Retrieve relevant medical context
            medical_context = []
            search_queries = [
                user_query,
                f"endometriosis {risk_level} risk symptoms",
                "endometriosis diagnosis next steps"
            ]
            
            for query in search_queries:
                docs = self.vector_store.search_similar_documents(query, k=2)
                for doc in docs:
                    if doc.page_content not in medical_context:
                        medical_context.append(doc.page_content[:500])
            
            logger.info(f"📚 Retrieved {len(medical_context)} medical context documents")
            
            # Generate explanation
            if use_fallback:
                logger.info("📝 Using fallback response (forced)")
                explanation = self._get_fallback_explanation(risk_level, user_query, endo_probability)
            else:
                logger.info("🤖 Attempting to generate AI explanation with Together API...")
                try:
                    explanation = self.llama_client.generate_explanation(
                        user_query=user_query,
                        prediction_result=prediction_result,
                        medical_context=medical_context[:2]
                    )
                    
                    # Check if we got a valid response
                    if not explanation or len(explanation.strip()) < 50:
                        logger.warning("⚠️ AI response was too short, using fallback")
                        explanation = self._get_fallback_explanation(risk_level, user_query, endo_probability)
                    else:
                        logger.info(f"✅ Successfully generated AI explanation ({len(explanation)} chars)")
                        
                except Exception as ai_error:
                    logger.warning(f"⚠️ AI generation failed: {ai_error}, using fallback")
                    explanation = self._get_fallback_explanation(risk_level, user_query, endo_probability)
            
            # Add structured recommendations
            recommendations = self._get_recommendations(risk_level, endo_probability)
            
            result = {
                "explanation": explanation,
                "recommendations": recommendations,
                "risk_level": risk_level,
                "confidence": confidence,
                "medical_context_used": len(medical_context),
                "prediction_summary": {
                    "label": prediction_label,
                    "probability": endo_probability,
                    "risk_level": risk_level
                }
            }
            
            logger.info(f"🎉 Generated complete explanation response")
            return result
            
        except Exception as e:
            logger.error(f"💥 Error generating explanation: {e}")
            # Return fallback response on error
            return {
                "explanation": self._get_fallback_explanation(risk_level, user_query, endo_probability),
                "recommendations": self._get_recommendations(risk_level, endo_probability),
                "risk_level": risk_level,
                "confidence": confidence,
                "error": str(e),
                "prediction_summary": {
                    "label": prediction_label,
                    "probability": endo_probability,
                    "risk_level": risk_level
                }
            }
    
    def answer_specific_question(self, question: str, prediction_result: Dict) -> str:
        """Answer specific questions about endometriosis or predictions."""
        logger.info(f"❓ Answering specific question: {question}")
        
        try:
            # Try to get AI answer using Together API
            answer = self.llama_client.answer_question(question, prediction_result)
            
            # Check if we got a valid response
            if not answer or len(answer.strip()) < 20:
                logger.warning("⚠️ AI answer was too short, using fallback")
                answer = self._get_fallback_answer(question, prediction_result.get('risk_level', 'moderate'))
            else:
                logger.info(f"✅ Successfully answered question ({len(answer)} chars)")
            
            return answer
            
        except Exception as e:
            logger.error(f"💥 Error answering question: {e}")
            return self._get_fallback_answer(question, prediction_result.get('risk_level', 'moderate'))
    
    def _get_fallback_explanation(self, risk_level: str, user_query: str, probability: float) -> str:
        """Generate fallback explanation."""
        probability_percent = int(probability * 100)
        
        if risk_level == "high" or probability > 0.7:
            return f"""Your analysis shows a {probability_percent}% risk score, which indicates a higher likelihood that your symptoms may be related to endometriosis. This means your combination of symptoms - particularly pain patterns, menstrual irregularities, and other factors - creates a pattern that's often seen in endometriosis cases.

**What this means:** Your symptoms align closely with patterns commonly seen in diagnosed cases. This doesn't mean you definitely have endometriosis, but it suggests you should seek medical evaluation promptly.

**Important next steps:**
- Schedule an appointment with a gynecologist as soon as possible
- Bring your symptom tracking data to the appointment
- Don't let anyone dismiss your concerns - you know your body best
- Consider bringing a support person to your appointment

**Remember:** This is a screening tool to help guide your healthcare decisions, not a definitive diagnosis. Only a healthcare provider can properly diagnose endometriosis through examination and potentially imaging or surgical procedures.

Many effective treatments are available, and early intervention often leads to better outcomes. You're taking an important step by tracking your symptoms and seeking information."""
        
        elif risk_level == "moderate" or (probability > 0.3 and probability <= 0.7):
            return f"""Your analysis shows a {probability_percent}% risk score, indicating moderate concern. Some of your symptoms align with patterns seen in endometriosis, but the picture isn't entirely clear.

**What this means:** Your symptom pattern has some features that could be associated with endometriosis, but other factors might also explain what you're experiencing.

**Recommended next steps:**
- Schedule a consultation with a gynecologist to discuss your symptoms
- Continue tracking your symptoms to identify patterns
- Discuss your family history and other risk factors with your doctor
- Don't delay seeking care if symptoms are affecting your quality of life

**Keep in mind:** Many conditions can cause similar symptoms to endometriosis. A healthcare provider can help determine the most likely causes and appropriate tests or treatments.

Whether or not you have endometriosis, your symptoms deserve attention and proper medical evaluation."""
        
        else:  # Low risk
            return f"""Your analysis shows a {probability_percent}% risk score, which is considered lower risk. Your current symptoms don't strongly match typical endometriosis patterns, but every person's experience is unique.

**What this means:** Based on your symptom pattern, endometriosis is less likely, but this doesn't completely rule out the condition or other health concerns.

**Still important to consider:**
- Continue monitoring your symptoms over time
- Maintain regular gynecological check-ups
- Consult a healthcare provider if symptoms worsen or new symptoms develop
- Consider other potential causes for your symptoms

**Remember:** Even with a lower risk score, if your symptoms are concerning you or affecting your quality of life, it's always appropriate to seek medical advice. Healthcare providers can help identify other potential causes and provide appropriate care.

Trust your body and don't hesitate to advocate for your health."""
    
    def _get_recommendations(self, risk_level: str, probability: float) -> List[Dict]:
        """Get structured recommendations based on risk level."""
        base_recommendations = [
            {
                "category": "Self-Care",
                "action": "Continue tracking your symptoms",
                "description": "Keep detailed records of pain, bleeding, and other symptoms to share with healthcare providers."
            },
            {
                "category": "Lifestyle",
                "action": "Practice stress management",
                "description": "Try relaxation techniques, gentle exercise, and adequate sleep to help manage symptoms."
            }
        ]
        
        if risk_level == "high" or probability > 0.7:
            base_recommendations.extend([
                {
                    "category": "Medical Care",
                    "action": "Schedule gynecologist appointment urgently",
                    "description": "Book an appointment as soon as possible to discuss your symptoms and diagnostic options.",
                    "priority": "high"
                },
                {
                    "category": "Preparation",
                    "action": "Prepare for medical appointment",
                    "description": "Gather symptom records, family history, and list of questions for your doctor.",
                    "priority": "high"
                }
            ])
        elif risk_level == "moderate" or probability > 0.3:
            base_recommendations.extend([
                {
                    "category": "Medical Care",
                    "action": "Schedule gynecologist consultation",
                    "description": "Make an appointment to discuss your symptoms and explore potential causes.",
                    "priority": "medium"
                }
            ])
        else:
            base_recommendations.extend([
                {
                    "category": "Monitoring",
                    "action": "Continue regular check-ups",
                    "description": "Maintain routine gynecological care and mention any concerning symptoms."
                }
            ])
        
        return base_recommendations
    
    def _get_fallback_answer(self, question: str, risk_level: str) -> str:
        """Generate fallback answer for specific questions."""
        lowerQuestion = question.lower()
        
        if 'next steps' in lowerQuestion or 'what should i do' in lowerQuestion:
            if risk_level.lower() == 'high':
                return "With your high risk score, I recommend scheduling an appointment with a gynecologist as soon as possible. Bring your symptom tracking data and prepare a list of questions. Don't let anyone dismiss your concerns - you know your body best."
            elif risk_level.lower() == 'moderate':
                return "Your moderate risk score suggests you should schedule a consultation with a gynecologist to discuss your symptoms. Continue tracking your symptoms and consider discussing your family history with your doctor."
            else:
                return "Continue monitoring your symptoms and maintain regular gynecological check-ups. If symptoms worsen or new symptoms develop, don't hesitate to consult a healthcare provider."
        
        if 'accurate' in lowerQuestion or 'accuracy' in lowerQuestion:
            return "This analysis is based on symptom patterns and machine learning, but only a healthcare professional can provide a definitive diagnosis. The tool helps you understand when to seek medical care and what information to share with your doctor."
        
        if 'concerning' in lowerQuestion or 'symptoms' in lowerQuestion:
            return "The most concerning symptoms include severe pelvic pain that interferes with daily activities, heavy bleeding, pain during intercourse, and persistent digestive issues. Any combination of worsening symptoms should be evaluated by a healthcare provider."
        
        if 'doctor' in lowerQuestion or 'see' in lowerQuestion:
            if risk_level.lower() == 'high':
                return "You should see a doctor as soon as possible, ideally within the next few weeks. Look for a gynecologist experienced with endometriosis and pelvic pain."
            else:
                return "Consider scheduling an appointment with a gynecologist within the next few months, or sooner if symptoms worsen or are affecting your quality of life."
        
        if 'treatment' in lowerQuestion or 'options' in lowerQuestion:
            return "Treatment options vary depending on severity and include pain management, hormonal therapies like birth control pills, and surgical options. The best plan depends on your specific situation and should be discussed with a healthcare provider who can evaluate your individual needs."
        
        return "That's a great question about your health. I recommend discussing this specific concern with a healthcare provider who can give you personalized medical advice based on your complete health history and symptoms."

# Example usage and testing
if __name__ == "__main__":
    # Test the explanation service
    service = EndometriosisExplanationService()
    
    # Sample prediction result
    sample_prediction = {
        "prediction": 1,
        "prediction_label": "Endometriosis",
        "confidence": 0.78,
        "probabilities": {
            "no_endometriosis": 0.22,
            "endometriosis": 0.78
        },
        "risk_level": "High"
    }
    
    # Test explanation generation
    user_query = "What does my 78% probability mean? Should I be worried?"
    
    result = service.generate_explanation(user_query, sample_prediction)
    
    print("=== Together API Explanation Service Test ===")
    print(f"User Query: {user_query}")
    print(f"Risk Level: {result['risk_level']}")
    print(f"Explanation:\n{result['explanation']}")
    print(f"\nRecommendations:")
    for rec in result['recommendations']:
        priority = rec.get('priority', 'normal')
        print(f"- [{rec['category']}] {rec['action']} ({priority})")
        print(f"  {rec['description']}")