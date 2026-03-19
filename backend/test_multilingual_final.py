#!/usr/bin/env python3
"""
Test script to verify the multilingual configuration system works correctly.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_multilingual_config():
    print("🧪 Testing Multilingual Configuration System...")
    
    try:
        from voca.config.multilingual_config import (
            DEFAULT_AGENT_CONFIG,
            merge_config,
            validate_agent_config,
            resolve_final_config,
            get_voice_for_language,
            get_voice,
            get_language,
            get_role,
            get_company,
            generate_multilingual_system_prompt,
            VOICE_MAP,
            SUPPORTED_LANGUAGES
        )
        print("✅ All imports successful")
        
        # Test 1: Default configuration
        assert DEFAULT_AGENT_CONFIG['language'] == 'en'
        assert DEFAULT_AGENT_CONFIG['role'] == 'receptionist'
        assert DEFAULT_AGENT_CONFIG['voice_id'] == 'en-US-natalie'
        print("✅ Default configuration test passed")
        
        # Test 2: Voice mapping
        assert get_voice_for_language('hi') == 'hi-IN-aditi'
        assert get_voice_for_language('ta') == 'ta-IN-kavitha'
        assert get_voice_for_language('unsupported') == 'en-US-natalie'  # fallback
        print("✅ Voice mapping test passed")
        
        # Test 3: Configuration merging
        user_config = {
            'role': 'sales',
            'language': 'hi',
            'company': {
                'name': 'भारत सेल्स',
                'services': ['बिक्री', 'समर्थन']
            }
        }
        merged = merge_config(user_config, DEFAULT_AGENT_CONFIG)
        assert merged['role'] == 'sales'
        assert merged['language'] == 'hi'
        assert merged['voice_id'] == 'en-US-natalie'  # from default
        assert merged['company']['name'] == 'भारत सेल्स'
        print("✅ Configuration merging test passed")
        
        # Test 4: Final configuration resolution
        final_config = resolve_final_config(user_config, 'ta')
        assert final_config['language'] == 'ta'  # detected language overrides
        assert final_config['voice_id'] == 'ta-IN-kavitha'  # voice updated for detected language
        assert final_config['role'] == 'sales'  # user config preserved
        print("✅ Final configuration resolution test passed")
        
        # Test 5: Safe access helpers
        assert get_voice(final_config) == 'ta-IN-kavitha'
        assert get_language(final_config) == 'ta'
        assert get_role(final_config) == 'sales'
        assert get_company(final_config)['name'] == 'भारत सेल्स'
        print("✅ Safe access helpers test passed")
        
        # Test 6: System prompt generation
        prompt = generate_multilingual_system_prompt(final_config)
        assert 'sales' in prompt
        assert 'ta' in prompt
        assert 'भारत सेल्स' in prompt
        assert 'Always respond in ta' in prompt
        print("✅ System prompt generation test passed")
        
        # Test 7: Supported languages
        assert 'en' in SUPPORTED_LANGUAGES
        assert 'hi' in SUPPORTED_LANGUAGES
        assert 'ta' in SUPPORTED_LANGUAGES
        assert len(SUPPORTED_LANGUAGES) >= 10
        print("✅ Supported languages test passed")
        
        # Test 8: Voice mapping completeness
        for lang in SUPPORTED_LANGUAGES:
            assert lang in VOICE_MAP
            assert VOICE_MAP[lang] is not None
        print("✅ Voice mapping completeness test passed")
        
        print("\n🎉 ALL TESTS PASSED! Multilingual configuration system is working correctly.")
        
        # Show example configurations
        print("\n📋 Example Configurations:")
        
        print("\n1️⃣ English Receptionist (Default):")
        english_config = resolve_final_config(None)
        print(f"   Language: {get_language(english_config)}")
        print(f"   Role: {get_role(english_config)}")
        print(f"   Voice: {get_voice(english_config)}")
        print(f"   Company: {get_company(english_config)['name']}")
        
        print("\n2️⃣ Hindi Sales Agent:")
        hindi_config = resolve_final_config({'role': 'sales'}, 'hi')
        print(f"   Language: {get_language(hindi_config)}")
        print(f"   Role: {get_role(hindi_config)}")
        print(f"   Voice: {get_voice(hindi_config)}")
        print(f"   Company: {get_company(hindi_config)['name']}")
        
        print("\n3️⃣ Tamil Support Agent:")
        tamil_config = resolve_final_config({'role': 'support', 'company': {'name': 'தமிழ் சப்போர்ட்'}}, 'ta')
        print(f"   Language: {get_language(tamil_config)}")
        print(f"   Role: {get_role(tamil_config)}")
        print(f"   Voice: {get_voice(tamil_config)}")
        print(f"   Company: {get_company(tamil_config)['name']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_multilingual_config()
    sys.exit(0 if success else 1)
