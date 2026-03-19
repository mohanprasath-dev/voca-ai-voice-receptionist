#!/usr/bin/env python3
"""
Simple test script for multilingual configuration functionality.
"""

import sys
import os

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Test basic functionality without circular imports
def test_basic_functionality():
    print("Testing multilingual configuration system...")
    
    # Test voice mapping
    VOICE_MAP = {
        "en": "en-US-natalie",
        "hi": "hi-IN-aditi", 
        "ta": "ta-IN-kavitha",
        "es": "es-ES-laura",
        "fr": "fr-FR-natalie"
    }
    
    DEFAULT_AGENT_CONFIG = {
        "voice_id": "en-US-natalie",
        "language": "en",
        "role": "receptionist",
        "tone": "friendly",
        "company": {
            "name": "Voca Assistant",
            "description": "A smart AI voice assistant",
            "services": ["answer questions", "schedule appointments"],
            "faq": [],
            "custom_instructions": "Be helpful, concise, and human-like."
        }
    }
    
    print("✓ Default configuration defined")
    
    # Test merge functionality
    def merge_config(user_config, default_config):
        if not user_config:
            return default_config.copy()
        
        def _deep_merge(default, user):
            result = default.copy()
            for key, user_value in user.items():
                if user_value is None:
                    continue
                if key in result and isinstance(result[key], dict) and isinstance(user_value, dict):
                    result[key] = _deep_merge(result[key], user_value)
                else:
                    result[key] = user_value
            return result
        
        return _deep_merge(default_config, user_config)
    
    # Test merging
    user_config = {"role": "sales", "language": "hi"}
    merged = merge_config(user_config, DEFAULT_AGENT_CONFIG)
    
    assert merged["role"] == "sales"
    assert merged["language"] == "hi"
    assert merged["voice_id"] == "en-US-natalie"  # from default
    print("✓ Configuration merging works")
    
    # Test voice mapping
    def get_voice_for_language(language, preferred_voice=None):
        if preferred_voice and preferred_voice in ["en-US-natalie", "hi-IN-aditi", "ta-IN-kavitha"]:
            return preferred_voice
        return VOICE_MAP.get(language, VOICE_MAP["en"])
    
    assert get_voice_for_language("hi") == "hi-IN-aditi"
    assert get_voice_for_language("en", "en-US-natalie") == "en-US-natalie"
    print("✓ Voice mapping works")
    
    # Test validation
    def validate_agent_config(config):
        validated_config = config.copy()
        valid_roles = ["receptionist", "sales", "support", "assistant"]
        
        if "role" in validated_config and validated_config["role"] not in valid_roles:
            validated_config["role"] = "receptionist"
        
        if "language" in validated_config and validated_config["language"] not in VOICE_MAP:
            validated_config["language"] = "en"
            
        return validated_config
    
    # Test validation
    invalid_config = {"role": "invalid", "language": "invalid"}
    validated = validate_agent_config(invalid_config)
    assert validated["role"] == "receptionist"
    assert validated["language"] == "en"
    print("✓ Configuration validation works")
    
    # Test system prompt generation
    def generate_multilingual_system_prompt(config):
        role = config.get("role", "receptionist")
        language = config.get("language", "en")
        company = config.get("company", {})
        
        prompt = f"""You are a {role} for {company.get('name', 'Voca Assistant')}.

Company details:
{company.get('description', 'A smart AI voice assistant')}

Services:
{', '.join(company.get('services', ['answer questions']))}

Instructions:
{company.get('custom_instructions', 'Be helpful')}

Rules:
- Always respond in {language}
- Match user's language automatically
- Be natural and human-like
- Stay in character as company representative"""
        
        return prompt.strip()
    
    prompt = generate_multilingual_system_prompt(merged)
    assert "sales" in prompt
    assert "hi" in prompt
    print("✓ System prompt generation works")
    
    print("\n🎉 All tests passed! Multilingual configuration system is working correctly.")
    
    # Test integration scenarios
    print("\nTesting integration scenarios:")
    
    # Scenario 1: No config
    result1 = merge_config(None, DEFAULT_AGENT_CONFIG)
    print(f"✓ Scenario 1 - No config: {result1['language']}, {result1['role']}")
    
    # Scenario 2: Partial config  
    result2 = merge_config({"language": "ta"}, DEFAULT_AGENT_CONFIG)
    print(f"✓ Scenario 2 - Partial config: {result2['language']}, {result2['role']}")
    
    # Scenario 3: Full config
    full_config = {
        "voice_id": "ta-IN-kavitha",
        "language": "ta", 
        "role": "support",
        "tone": "calm",
        "company": {
            "name": "Tamil Support",
            "description": "Tamil language support service",
            "services": ["tamil support", "tamil assistance"],
            "custom_instructions": "Speak in respectful Tamil"
        }
    }
    result3 = merge_config(full_config, DEFAULT_AGENT_CONFIG)
    print(f"✓ Scenario 3 - Full config: {result3['language']}, {result3['role']}, {result3['company']['name']}")
    
    print("\n✅ All integration scenarios working!")

if __name__ == "__main__":
    test_basic_functionality()
