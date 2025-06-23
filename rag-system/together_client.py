import os
import logging
from typing import Dict, List, Optional
from together import Together

logger = logging.getLogger(__name__)

class TogetherLlamaClient:
    def __init__(self, api_key: str = "a292a1df015e7c16357e8c36937fa671bd7148b0d66a14bb9e060e846dca9130"):
        """Initialize Together API client with DeepSeek-V3 model."""
        self.api_key = api_key
        self.model = "deepseek-ai/DeepSeek-V3"
        
        # Initialize Together client
        self.client = Together(api_key=self.api_key)
        
        logger.info(f"🚀 Together API client initialized with DeepSeek-V3")
        logger.info(f"🔑 API Key: {self.api_key[:10]}...")
        
    def send_request(self, prompt: str, max_tokens: int = 300, temperature: float = 0.7) -> str:
        """Send request to Together API and get response."""
        
        logger.info(f"📤 Sending request to DeepSeek-V3...")
        logger.info(f"📝 Prompt: {prompt[:100]}...")
        logger.info(f"🎯 Max tokens: {max_tokens}")
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=0.9,
                stream=False
            )
            
            # Extract the generated text
            if response.choices and len(response.choices) > 0:
                generated_text = response.choices[0].message.content
                
                if generated_text and generated_text.strip():
                    logger.info(f"✅ Successfully generated response ({len(generated_text)} chars)")
                    logger.info(f"📄 Response preview: {generated_text[:100]}...")
                    return generated_text.strip()
                else:
                    logger.warning("⚠️ Empty response from API")
                    return self._get_fallback_response(prompt)
            else:
                logger.warning("⚠️ No choices in API response")
                return self._get_fallback_response(prompt)
                
        except Exception as e:
            logger.error(f"❌ Together API error: {e}")
            return self._get_fallback_response(prompt)
    
    def generate_explanation(self, user_query: str, prediction_result: Dict, medical_context: List[str]) -> str:
        """Generate explanation for endometriosis prediction using DeepSeek-V3."""
        
        risk_level = prediction_result.get('risk_level', 'Unknown')
        probability = prediction_result.get('probabilities', {}).get('endometriosis', 0)
        confidence = prediction_result.get('confidence', 0)
        
        # Format medical context
        context_text = ""
        if medical_context:
            context_text = "\n\nRelevant Medical Information:\n" + "\n".join([f"- {ctx[:200]}..." for ctx in medical_context[:2]])
        
        # Create comprehensive prompt for DeepSeek-V3
        prompt = f"""You are a compassionate medical AI assistant helping explain endometriosis prediction results. Please provide a clear, empathetic explanation.

User Question: {user_query}

Prediction Results:
- Risk Level: {risk_level}
- Probability Score: {probability:.0%}
- Confidence: {confidence:.0%}
- Prediction: {prediction_result.get('prediction_label', 'Unknown')}

{context_text}

Please provide a clear, supportive explanation that:
1. Explains what the {probability:.0%} risk score means in simple terms
2. Provides context about what this risk level indicates
3. Offers practical, actionable next steps
4. Emphasizes the importance of professional medical consultation
5. Is reassuring but informative, avoiding medical jargon

Keep your response conversational, supportive, and around 200-300 words. Focus on helping the user understand their results and what to do next."""

        logger.info("🧠 Generating medical explanation with DeepSeek-V3...")
        return self.send_request(prompt, max_tokens=400, temperature=0.7)
    
    def answer_question(self, question: str, prediction_result: Dict) -> str:
        """Answer a specific question about endometriosis using DeepSeek-V3."""
        
        risk_level = prediction_result.get('risk_level', 'Unknown')
        probability = prediction_result.get('probabilities', {}).get('endometriosis', 0)
        
        prompt = f"""You are a knowledgeable medical assistant. Please answer this question about endometriosis clearly and accurately.

Question: {question}

Context: The user has received a {risk_level.lower()} risk assessment with a {probability:.0%} probability score for endometriosis.

Please provide a helpful, accurate answer that:
1. Directly addresses their question
2. Provides relevant medical information
3. Considers their specific risk level
4. Always recommends consulting healthcare professionals for medical decisions
5. Is clear and easy to understand

Keep your response concise but informative (2-3 sentences), and always emphasize the importance of professional medical care."""

        logger.info(f"❓ Answering question with DeepSeek-V3: {question}")
        return self.send_request(prompt, max_tokens=200, temperature=0.6)
    
    def _get_fallback_response(self, prompt: str) -> str:
        """Generate fallback response when API fails."""
        prompt_lower = prompt.lower()
        
        if "what does" in prompt_lower and ("%" in prompt or "probability" in prompt_lower or "risk score" in prompt_lower):
            return """Your risk score represents how closely your symptom pattern matches those typically seen in endometriosis cases. A higher percentage means your symptoms align more closely with diagnosed cases.

**What this means:** This is a screening tool that helps identify when to seek medical care, not a diagnosis. The score is based on patterns in your symptom data compared to known cases.

**Important next steps:**
- Schedule an appointment with a gynecologist to discuss your symptoms
- Bring your symptom tracking data to the appointment
- Don't let anyone dismiss your concerns - you know your body best

Remember: Only a healthcare professional can provide a proper diagnosis through examination and potentially imaging or surgical procedures. This tool helps guide your healthcare decisions."""
        
        elif "next steps" in prompt_lower or "what should i do" in prompt_lower:
            return """Based on your results, here are the recommended next steps:

**Immediate actions:**
1. Schedule an appointment with a gynecologist as soon as possible
2. Gather your symptom tracking data and any relevant medical history
3. Prepare a list of questions about your symptoms and concerns
4. Consider bringing a support person to your appointment

**Important reminders:**
- Don't let anyone dismiss your symptoms - advocate for yourself
- Early diagnosis and treatment often lead to better outcomes
- Many effective treatments are available for endometriosis
- You're taking an important step by tracking your symptoms

Your health matters, and seeking medical evaluation is the right choice."""
        
        elif "accurate" in prompt_lower or "accuracy" in prompt_lower:
            return """This analysis is based on machine learning patterns from symptom data, but it has important limitations:

**What it can do:**
- Identify symptom patterns associated with endometriosis
- Help you understand when to seek medical care
- Provide guidance on symptom tracking

**What it cannot do:**
- Provide a definitive diagnosis (only doctors can do this)
- Account for all individual factors and medical history
- Replace comprehensive medical evaluation

**Bottom line:** The tool is designed to help you make informed decisions about seeking medical care, but should never replace professional medical evaluation. Its accuracy depends on honest symptom reporting and is most useful as a screening tool."""
        
        elif "concerning" in prompt_lower or "symptoms" in prompt_lower:
            return """The most concerning symptoms that warrant prompt medical attention include:

**High priority symptoms:**
- Severe pelvic pain that interferes with daily activities
- Heavy bleeding that soaks through protection every hour
- Pain during intercourse that's worsening
- Persistent digestive issues during menstruation

**Other important symptoms:**
- Chronic fatigue that's affecting your quality of life
- Symptoms that are progressively getting worse
- Pain that doesn't respond to over-the-counter medications

**When to seek immediate care:**
Any combination of these symptoms, especially if they're affecting your work, relationships, or daily activities, should be evaluated by a healthcare provider promptly. Trust your instincts about your body."""
        
        elif "treatment" in prompt_lower or "options" in prompt_lower:
            return """Treatment options for endometriosis vary based on severity, symptoms, and your personal goals:

**Pain Management:**
- Over-the-counter pain relievers (NSAIDs)
- Prescription pain medications
- Heat therapy, relaxation techniques, gentle exercise

**Hormonal Therapy:**
- Birth control pills, patches, or rings
- Progestin therapy
- GnRH agonists and antagonists

**Surgical Options:**
- Laparoscopic surgery to remove endometrial tissue
- In severe cases, more extensive procedures

**Lifestyle Support:**
- Stress management and counseling
- Dietary modifications
- Support groups

The best treatment plan is highly individual and should be developed with a healthcare provider who understands your specific situation, symptoms, and goals."""
        
        else:
            return """Thank you for your question about endometriosis and your health. Based on your symptom analysis, I recommend discussing your specific concerns with a healthcare provider who can give you personalized medical advice.

If you're experiencing concerning symptoms, don't hesitate to seek medical attention. Your health and well-being are important, and healthcare providers are there to help you understand and manage your symptoms.

Remember: This analysis is a tool to help guide your healthcare decisions, but professional medical evaluation is essential for proper diagnosis and treatment."""

# Test the Together client
if __name__ == "__main__":
    print("🧪 Testing Together API with DeepSeek-V3")
    print("=" * 50)
    
    client = TogetherLlamaClient()
    
    # Test 1: Simple question
    print("\n🤖 Test 1: Simple Medical Question")
    print("-" * 40)
    
    simple_question = "What is endometriosis and what are its main symptoms?"
    print(f"📝 Question: {simple_question}")
    
    response = client.send_request(simple_question, max_tokens=200)
    print(f"📤 Response: {response}")
    
    # Test 2: Medical explanation
    print("\n🏥 Test 2: Medical Explanation Generation")
    print("-" * 45)
    
    sample_prediction = {
        "prediction_label": "Endometriosis",
        "confidence": 0.78,
        "risk_level": "High",
        "probabilities": {"endometriosis": 0.78, "no_endometriosis": 0.22}
    }
    
    user_query = "What does my 78% risk score mean? Should I be worried?"
    print(f"📝 User query: {user_query}")
    
    explanation = client.generate_explanation(user_query, sample_prediction, [])
    print(f"📤 Explanation: {explanation}")
    
    # Test 3: Question answering
    print("\n❓ Test 3: Question Answering")
    print("-" * 35)
    
    question = "What are the next steps I should take?"
    print(f"📝 Question: {question}")
    
    answer = client.answer_question(question, sample_prediction)
    print(f"📤 Answer: {answer}")
    
    print("\n🎉 Together API test complete!")