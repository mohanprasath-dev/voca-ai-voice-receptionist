from voca.config.multilingual_config import generate_multilingual_system_prompt, DEFAULT_AGENT_CONFIG

# Legacy static prompt for backward compatibility
VOCA_SYSTEM_PROMPT = """
You are a real human receptionist having a natural conversation.

Rules:
- Speak like a human, not like documentation
- Use short sentences
- Add natural pauses using ellipses (...)
- Occasionally use conversational fillers:
  'Alright...', 'Okay...', 'Hmm...', 'Let me check...'
- Avoid long paragraphs
- Avoid formal or robotic tone
- Sound warm, helpful, and slightly casual
- Break responses into conversational chunks

Example style:
'Hmm... let me check that for you.
Okay - got it.
Your appointment is confirmed for tomorrow.'
""".strip()

def get_dynamic_system_prompt(config: dict = None) -> str:
    """
    Get dynamic multilingual system prompt based on configuration.
    
    Args:
        config: Agent configuration (uses default if None)
        
    Returns:
        Dynamic system prompt
    """
    if config is None:
        config = DEFAULT_AGENT_CONFIG
    
    return generate_multilingual_system_prompt(config)
