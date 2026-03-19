from voca.config.multilingual_config import (
    generate_multilingual_system_prompt,
    DEFAULT_AGENT_CONFIG,
)


def get_dynamic_system_prompt(config: dict = None) -> str:
    """Get the system prompt for the given agent config."""
    if config is None:
        config = DEFAULT_AGENT_CONFIG
    return generate_multilingual_system_prompt(config)
