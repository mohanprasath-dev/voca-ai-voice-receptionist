from voca.config.multilingual_config import DEFAULT_AGENT_CONFIG
from voca.prompts.system_prompt import generate_multilingual_system_prompt


def get_dynamic_system_prompt(config: dict = None) -> str:
    """Returns the system prompt for the given agent configuration."""
    return generate_multilingual_system_prompt(config or DEFAULT_AGENT_CONFIG)
