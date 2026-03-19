"""
Test suite for multilingual configuration system.

Tests all scenarios:
1. No config → defaults
2. Partial config → merged
3. Full config → customized
4. Mixed language input
5. Language switching mid conversation
"""

import pytest
from voca.config.multilingual_config import (
    DEFAULT_AGENT_CONFIG,
    merge_config,
    validate_agent_config,
    resolve_final_config,
    get_voice_for_language,
    get_voice,
    get_role,
    get_company,
    get_language,
    generate_multilingual_system_prompt,
    VOICE_MAP,
    SUPPORTED_LANGUAGES,
    VALID_ROLES
)


class TestDefaultConfig:
    """Test default configuration structure."""
    
    def test_default_config_structure(self):
        """Test that default config has all required fields."""
        assert "voice_id" in DEFAULT_AGENT_CONFIG
        assert "language" in DEFAULT_AGENT_CONFIG
        assert "role" in DEFAULT_AGENT_CONFIG
        assert "tone" in DEFAULT_AGENT_CONFIG
        assert "company" in DEFAULT_AGENT_CONFIG
        
        # Test company structure
        company = DEFAULT_AGENT_CONFIG["company"]
        assert "name" in company
        assert "description" in company
        assert "services" in company
        assert "faq" in company
        assert "custom_instructions" in company
    
    def test_default_values(self):
        """Test default configuration values."""
        assert DEFAULT_AGENT_CONFIG["voice_id"] == "en-US-natalie"
        assert DEFAULT_AGENT_CONFIG["language"] == "en"
        assert DEFAULT_AGENT_CONFIG["role"] == "receptionist"
        assert DEFAULT_AGENT_CONFIG["tone"] == "friendly"


class TestMergeConfig:
    """Test configuration merging functionality."""
    
    def test_merge_with_none(self):
        """Test merging with None returns default."""
        result = merge_config(None, DEFAULT_AGENT_CONFIG)
        assert result == DEFAULT_AGENT_CONFIG
    
    def test_merge_empty_config(self):
        """Test merging empty dict returns default."""
        result = merge_config({}, DEFAULT_AGENT_CONFIG)
        assert result == DEFAULT_AGENT_CONFIG
    
    def test_merge_partial_config(self):
        """Test merging partial configuration."""
        user_config = {
            "voice_id": "hi-IN-aditi",
            "language": "hi"
        }
        
        result = merge_config(user_config, DEFAULT_AGENT_CONFIG)
        
        assert result["voice_id"] == "hi-IN-aditi"
        assert result["language"] == "hi"
        assert result["role"] == "receptionist"  # from default
        assert result["tone"] == "friendly"  # from default
    
    def test_merge_nested_company_config(self):
        """Test merging nested company configuration."""
        user_config = {
            "company": {
                "name": "Custom Company",
                "services": ["custom service"]
            }
        }
        
        result = merge_config(user_config, DEFAULT_AGENT_CONFIG)
        
        assert result["company"]["name"] == "Custom Company"
        assert result["company"]["services"] == ["custom service"]
        assert result["company"]["description"] == DEFAULT_AGENT_CONFIG["company"]["description"]
    
    def test_merge_ignores_none_values(self):
        """Test that None values are ignored during merge."""
        user_config = {
            "voice_id": None,
            "language": "hi",
            "role": None
        }
        
        result = merge_config(user_config, DEFAULT_AGENT_CONFIG)
        
        assert result["voice_id"] == DEFAULT_AGENT_CONFIG["voice_id"]  # kept from default
        assert result["language"] == "hi"  # updated
        assert result["role"] == DEFAULT_AGENT_CONFIG["role"]  # kept from default


class TestValidation:
    """Test configuration validation."""
    
    def test_validate_valid_config(self):
        """Test validation of valid configuration."""
        config = DEFAULT_AGENT_CONFIG.copy()
        result = validate_agent_config(config)
        assert result == config
    
    def test_validate_invalid_role(self):
        """Test validation fixes invalid role."""
        config = DEFAULT_AGENT_CONFIG.copy()
        config["role"] = "invalid_role"
        
        result = validate_agent_config(config)
        assert result["role"] == "receptionist"  # fallback
    
    def test_validate_invalid_voice(self):
        """Test validation fixes invalid voice."""
        config = DEFAULT_AGENT_CONFIG.copy()
        config["voice_id"] = "invalid-voice"
        
        result = validate_agent_config(config)
        assert result["voice_id"] == "en-US-natalie"  # fallback
    
    def test_validate_invalid_language(self):
        """Test validation fixes invalid language."""
        config = DEFAULT_AGENT_CONFIG.copy()
        config["language"] = "invalid"
        
        result = validate_agent_config(config)
        assert result["language"] == "en"  # fallback


class TestVoiceMapping:
    """Test voice mapping functionality."""
    
    def test_get_voice_for_language(self):
        """Test getting voice for language."""
        # Test supported languages
        assert get_voice_for_language("en") == "en-US-natalie"
        assert get_voice_for_language("hi") == "hi-IN-aditi"
        assert get_voice_for_language("ta") == "ta-IN-kavitha"
        
        # Test unsupported language falls back to English
        assert get_voice_for_language("invalid") == "en-US-natalie"
    
    def test_get_voice_for_language_with_preference(self):
        """Test voice preference override."""
        # User preference should be used if valid
        assert get_voice_for_language("en", "en-US-matthew") == "en-US-matthew"
        
        # Invalid preference should fall back to language mapping
        assert get_voice_for_language("hi", "invalid-voice") == "hi-IN-aditi"


class TestFinalConfigResolution:
    """Test final configuration resolution."""
    
    def test_resolve_no_user_config(self):
        """Test resolution with no user config."""
        result = resolve_final_config(None)
        assert result == DEFAULT_AGENT_CONFIG
    
    def test_resolve_with_detected_language(self):
        """Test resolution with detected language."""
        user_config = {"role": "sales"}
        detected_language = "hi"
        
        result = resolve_final_config(user_config, detected_language)
        
        assert result["language"] == detected_language
        assert result["role"] == "sales"
        # Voice should be updated to match detected language
        assert result["voice_id"] == get_voice_for_language(detected_language)
    
    def test_resolve_user_voice_preference_preserved(self):
        """Test that user voice preference is preserved."""
        user_config = {
            "voice_id": "en-US-matthew",
            "language": "en"
        }
        detected_language = "hi"
        
        result = resolve_final_config(user_config, detected_language)
        
        # User voice preference should be preserved
        assert result["voice_id"] == "en-US-matthew"
        assert result["language"] == detected_language


class TestSafeAccessHelpers:
    """Test safe access helper functions."""
    
    def test_get_voice(self):
        """Test safe voice access."""
        config = {"voice_id": "custom-voice"}
        assert get_voice(config) == "custom-voice"
        
        config_empty = {}
        assert get_voice(config_empty) == DEFAULT_AGENT_CONFIG["voice_id"]
    
    def test_get_role(self):
        """Test safe role access."""
        config = {"role": "sales"}
        assert get_role(config) == "sales"
        
        config_empty = {}
        assert get_role(config_empty) == DEFAULT_AGENT_CONFIG["role"]
    
    def test_get_company(self):
        """Test safe company access."""
        config = {"company": {"name": "Custom"}}
        assert get_company(config)["name"] == "Custom"
        
        config_empty = {}
        assert get_company(config_empty) == DEFAULT_AGENT_CONFIG["company"]
    
    def test_get_language(self):
        """Test safe language access."""
        config = {"language": "hi"}
        assert get_language(config) == "hi"
        
        config_empty = {}
        assert get_language(config_empty) == DEFAULT_AGENT_CONFIG["language"]


class TestSystemPromptGeneration:
    """Test dynamic system prompt generation."""
    
    def test_generate_prompt_default_config(self):
        """Test prompt generation with default config."""
        prompt = generate_multilingual_system_prompt(DEFAULT_AGENT_CONFIG)
        
        assert "receptionist" in prompt
        assert "Voca Assistant" in prompt
        assert "answer questions" in prompt
        assert "Always respond in en" in prompt
    
    def test_generate_prompt_custom_config(self):
        """Test prompt generation with custom config."""
        config = {
            "role": "sales",
            "language": "hi",
            "company": {
                "name": "Sales Corp",
                "description": "We sell products",
                "services": ["selling", "support"],
                "custom_instructions": "Be persuasive"
            }
        }
        
        prompt = generate_multilingual_system_prompt(config)
        
        assert "sales" in prompt
        assert "Sales Corp" in prompt
        assert "We sell products" in prompt
        assert "selling" in prompt
        assert "Be persuasive" in prompt
        assert "Always respond in hi" in prompt


class TestLanguageSupport:
    """Test multilingual language support."""
    
    def test_supported_languages(self):
        """Test supported languages list."""
        assert "en" in SUPPORTED_LANGUAGES
        assert "hi" in SUPPORTED_LANGUAGES
        assert "ta" in SUPPORTED_LANGUAGES
        assert "es" in SUPPORTED_LANGUAGES
    
    def test_voice_map_completeness(self):
        """Test that all supported languages have voice mappings."""
        for lang in SUPPORTED_LANGUAGES:
            assert lang in VOICE_MAP
            assert VOICE_MAP[lang] is not None
    
    def test_valid_roles(self):
        """Test valid roles list."""
        assert "receptionist" in VALID_ROLES
        assert "sales" in VALID_ROLES
        assert "support" in VALID_ROLES
        assert "assistant" in VALID_ROLES


class TestIntegrationScenarios:
    """Test end-to-end integration scenarios."""
    
    def test_scenario_1_no_config(self):
        """Test Scenario 1: No config → defaults."""
        result = resolve_final_config(None)
        
        assert result["voice_id"] == "en-US-natalie"
        assert result["language"] == "en"
        assert result["role"] == "receptionist"
        assert result["tone"] == "friendly"
    
    def test_scenario_2_partial_config(self):
        """Test Scenario 2: Partial config → merged."""
        user_config = {"role": "support", "language": "hi"}
        result = resolve_final_config(user_config)
        
        assert result["role"] == "support"
        assert result["language"] == "hi"
        assert result["voice_id"] == "hi-IN-aditi"  # auto-matched
        assert result["tone"] == "friendly"  # from default
    
    def test_scenario_3_full_config(self):
        """Test Scenario 3: Full config → customized."""
        user_config = {
            "voice_id": "en-US-matthew",
            "language": "en",
            "role": "sales",
            "tone": "urgent",
            "company": {
                "name": "Tech Company",
                "description": "We build software",
                "services": ["development", "consulting"],
                "custom_instructions": "Be technical but friendly"
            }
        }
        result = resolve_final_config(user_config)
        
        assert result["voice_id"] == "en-US-matthew"
        assert result["language"] == "en"
        assert result["role"] == "sales"
        assert result["tone"] == "urgent"
        assert result["company"]["name"] == "Tech Company"
    
    def test_scenario_4_language_switching(self):
        """Test Scenario 4: Language switching mid conversation."""
        # Start with English
        initial_config = resolve_final_config({"role": "receptionist"})
        assert initial_config["language"] == "en"
        
        # User switches to Hindi
        updated_config = resolve_final_config({"role": "receptionist"}, "hi")
        assert updated_config["language"] == "hi"
        assert updated_config["voice_id"] == "hi-IN-aditi"
        
        # User switches to Tamil
        final_config = resolve_final_config({"role": "receptionist"}, "ta")
        assert final_config["language"] == "ta"
        assert final_config["voice_id"] == "ta-IN-kavitha"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
