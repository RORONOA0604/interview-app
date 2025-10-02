# /api/parser.py
import re
import pdfplumber
import phonenumbers
from typing import Dict, Optional

class ResumeParser:
    def __init__(self):
        # ... (Your entire ResumeParser class code goes here) ...
        # Common name patterns (this is a simplified approach)
        self.name_patterns = [
            r'^[A-Z][a-z]+ [A-Z][a-z]+$',
            r'^[A-Z][a-z]+ [A-Z]\. [A-Z][a-z]+$',
        ]
    
    def extract_text_from_pdf(self, pdf_file) -> str:
        text = ""
        try:
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
        return text
    
    def extract_email(self, text: str) -> Optional[str]:
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        return emails[0] if emails else None
    
    def extract_phone_number(self, text: str) -> Optional[str]:
        try:
            for match in phonenumbers.PhoneNumberMatcher(text, "US"):
                # Return the first valid number found
                return phonenumbers.format_number(
                    match.number, phonenumbers.PhoneNumberFormat.E164
                )
        except Exception as e:
            print(f"Phone number extraction error: {e}")
        return None
    
    def extract_name(self, text: str) -> Optional[str]:
        lines = text.split('\n')
        name_indicators = [
            'summary', 'objective', 'experience', 'education', 
            'skills', 'projects', 'contact'
        ]
        
        for line in lines[:10]: # Check first 10 lines
            line = line.strip()
            if not line:
                continue
            
            words = line.split()
            if 2 <= len(words) <= 4: # Allow for middle names/initials
                if all(word.istitle() or (len(word) == 2 and word[1] == '.') for word in words):
                    if not any(indicator in line.lower() for indicator in name_indicators):
                        return line
        return None
    
    def parse_resume(self, pdf_file) -> Dict[str, Optional[str]]:
        text = self.extract_text_from_pdf(pdf_file)
        
        if not text:
            return {'error': 'Could not extract text from PDF'}
        
        name = self.extract_name(text)
        email = self.extract_email(text)
        phone = self.extract_phone_number(text)
        
        return {
            'name': name,
            'email': email,
            'phone': phone
        }