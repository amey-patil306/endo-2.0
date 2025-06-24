import os
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class TogetherLlamaClient:
    """Simplified Together API client with fallback responses."""
    
    def __init__(self, api_key: str = None):
        """Initialize client (simplified for Railway deployment)."""
        self.api_key = api_key or "demo-key"
        self.model = "demo-model"
        
        logger.info("🚀 Simplified Together client initialized")
        
    def send_request(self, prompt: str, max_tokens: int = 300, temperature: float = 0.7) -> str:
        """Send request (returns fallback response for Railway deployment)."""
        logger.info("📤 Using fallback response (Together API not available)")
        return self._get_fallback_response(prompt)
    
    def generate_explanation(self, user_query: str, prediction_result: Dict, medical_context: List[str]) -> str:
        """Generate explanation (simplified version)."""
        logger.info("🧠 Generating simplified explanation...")
        
        risk_level = prediction_result.get('risk_level', 'Unknown')
        probability = prediction_result.get('probabilities', {}).get('endometriosis', 0)
        
        return self._get_explanation_response(user_query, risk_level, probability)
    
    def answer_question(self, question: str, prediction_result: Dict) -> str:
        """Answer question (simplified version)."""
        logger.info(f"❓ Answering question: {question}")
        
        risk_level = prediction_result.get('risk_level', 'Unknown')
        return self._get_question_response(question, risk_level)
    
    def _get_fallback_response(self, prompt: str) -> str:
        """Generate fallback response based on prompt content."""
        prompt_lower = prompt.lower()
        
        if "explanation" in prompt_lower and "risk" in prompt_lower:
            return "Based on your symptom analysis, this assessment helps identify when to seek medical care. The risk score indicates how closely your symptoms match patterns seen in endometriosis cases. Please consult with a healthcare professional for proper evaluation and diagnosis."
        
        return "Thank you for your question. For the most accurate and personalized medical advice, please consult with a healthcare professional who can evaluate your specific situation."
    
    def _get_explanation_response(self, user_query: str, risk_level: str, probability: float) -> str:
        """Generate explanation response based on risk level."""
        probability_percent = int(probability * 100)
        
        if risk_level.lower() == 'high':
            return f"""Your analysis shows a {probability_percent}% risk score, indicating a higher likelihood that your symptoms may be related to endometriosis. This means your symptom combination creates a pattern often seen in diagnosed cases.

**What this means:**
Your symptoms align closely with patterns commonly seen in endometriosis cases. While this doesn't provide a definitive diagnosis, it suggests you should seek medical evaluation promptly.

**Important next steps:**
- Schedule an appointment with a gynecologist as soon as possible
- Bring your symptom tracking data to the appointment
- Don't let anyone dismiss your concerns - you know your body best
- Consider bringing a support person to your appointment

**Remember:** This is a screening tool to help guide your healthcare decisions, not a definitive diagnosis. Only a healthcare provider can properly diagnose endometriosis through examination and potentially imaging or surgical procedures."""
        
        elif risk_level.lower() == 'moderate':
            return f"""Your analysis shows a {probability_percent}% risk score, indicating moderate concern. Some of your symptoms align with patterns seen in endometriosis, but the picture isn't entirely clear.

**What this means:**
Your symptom pattern has some features that could be associated with endometriosis, but other factors might also explain what you're experiencing.

**Recommended next steps:**
- Schedule a consultation with a gynecologist to discuss your symptoms
- Continue tracking your symptoms to identify patterns
- Discuss your family history and other risk factors with your doctor
- Don't delay seeking care if symptoms are affecting your quality of life

**Keep in mind:** Many conditions can cause similar symptoms to endometriosis. A healthcare provider can help determine the most likely causes and appropriate tests or treatments."""
        
        else:  # Low risk
            return f"""Your analysis shows a {probability_percent}% risk score, which is considered lower risk. Your current symptoms don't strongly match typical endometriosis patterns, but every person's experience is unique.

**What this means:**
Based on your symptom pattern, endometriosis is less likely, but this doesn't completely rule out the condition or other health concerns.

**Still important to consider:**
- Continue monitoring your symptoms over time
- Maintain regular gynecological check-ups
- Consult a healthcare provider if symptoms worsen or new symptoms develop
- Consider other potential causes for your symptoms

**Remember:** Even with a lower risk score, if your symptoms are concerning you or affecting your quality of life, it's always appropriate to seek medical advice."""
    
    def _get_question_response(self, question: str, risk_level: str) -> str:
        """Generate response to specific questions."""
        question_lower = question.lower()
        
        if 'next steps' in question_lower or 'what should i do' in question_lower:
            if risk_level.lower() == 'high':
                return "With your high risk score, I recommend scheduling an appointment with a gynecologist as soon as possible. Bring your symptom tracking data and prepare a list of questions. Don't let anyone dismiss your concerns - you know your body best."
            elif risk_level.lower() == 'moderate':
                return "Your moderate risk score suggests you should schedule a consultation with a gynecologist to discuss your symptoms. Continue tracking your symptoms and consider discussing your family history with your doctor."
            else:
                return "Continue monitoring your symptoms and maintain regular gynecological check-ups. If symptoms worsen or new symptoms develop, don't hesitate to consult a healthcare provider."
        
        if 'accurate' in question_lower or 'accuracy' in question_lower:
            return "This analysis is based on symptom patterns and machine learning, but only a healthcare professional can provide a definitive diagnosis. The tool helps you understand when to seek medical care and what information to share with your doctor."
        
        if 'concerning' in question_lower or 'symptoms' in question_lower:
            return "The most concerning symptoms include severe pelvic pain that interferes with daily activities, heavy bleeding, pain during intercourse, and persistent digestive issues. Any combination of worsening symptoms should be evaluated by a healthcare provider."
        
        if 'doctor' in question_lower or 'see' in question_lower:
            if risk_level.lower() == 'high':
                return "You should see a doctor as soon as possible, ideally within the next few weeks. Look for a gynecologist experienced with endometriosis and pelvic pain."
            else:
                return "Consider scheduling an appointment with a gynecologist within the next few months, or sooner if symptoms worsen or are affecting your quality of life."
        
        if 'treatment' in question_lower or 'options' in question_lower:
            return "Treatment options vary depending on severity and include pain management, hormonal therapies like birth control pills, and surgical options. The best plan depends on your specific situation and should be discussed with a healthcare provider."
        
        return "That's a great question about your health. I recommend discussing this specific concern with a healthcare provider who can give you personalized medical advice based on your complete health history and symptoms."