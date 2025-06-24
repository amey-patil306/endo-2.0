# Simple vector store replacement for Railway deployment
import logging

logger = logging.getLogger(__name__)

class MedicalKnowledgeVectorStore:
    """Simplified vector store that doesn't require external dependencies."""
    
    def __init__(self):
        """Initialize with basic medical knowledge."""
        self.knowledge_base = [
            "Endometriosis is a condition where tissue similar to the uterine lining grows outside the uterus.",
            "Common symptoms include pelvic pain, heavy periods, and pain during intercourse.",
            "Diagnosis typically requires laparoscopy for definitive confirmation.",
            "Treatment options include pain management, hormonal therapy, and surgery.",
            "Early diagnosis and treatment can help manage symptoms and improve quality of life."
        ]
        logger.info("✅ Simplified vector store initialized")
    
    def create_vectorstore(self):
        """Create vector store (simplified version)."""
        logger.info("📚 Vector store ready with basic medical knowledge")
        return True
    
    def search_similar_documents(self, query: str, k: int = 2):
        """Search for similar documents (simplified version)."""
        # Return mock documents with basic medical info
        class MockDoc:
            def __init__(self, content):
                self.page_content = content
        
        # Return relevant knowledge based on query keywords
        relevant_docs = []
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['pain', 'symptom', 'treatment']):
            relevant_docs.append(MockDoc("Endometriosis commonly causes pelvic pain, especially during menstruation. Pain management includes NSAIDs, hormonal therapy, and lifestyle modifications."))
        
        if any(word in query_lower for word in ['diagnosis', 'doctor', 'medical']):
            relevant_docs.append(MockDoc("Diagnosis of endometriosis requires medical evaluation. A gynecologist can perform examinations and recommend appropriate tests."))
        
        if any(word in query_lower for word in ['risk', 'probability', 'chance']):
            relevant_docs.append(MockDoc("Risk assessment tools help identify when to seek medical care, but only healthcare professionals can provide definitive diagnosis."))
        
        # Default response if no specific keywords found
        if not relevant_docs:
            relevant_docs.append(MockDoc("Endometriosis is a complex condition that requires professional medical evaluation for proper diagnosis and treatment."))
        
        return relevant_docs[:k]