from typing import Iterator


class DemoScenarioEngine:
    """Deterministic scenario engine for live demo control."""

    SCENARIOS = {
        "normal_booking": [
            "I need to book an appointment tomorrow at 5 pm.",
            "My name is Alex.",
            "Yes, confirm it.",
        ],
        "user_interruption": [
            "Book for Friday.",
            "Wait, make that Saturday morning.",
            "Yes, Saturday is correct.",
        ],
        "multilingual_conversation": [
            "Hello, kal 5 baje appointment chahiye.",
            "Mera naam Ravi hai.",
            "Thanks, confirm karo.",
        ],
        "failure_recovery": [
            "I need an urgent appointment.",
            "Are you still there?",
            "Please connect me to a human.",
        ],
    }

    def __init__(self, demo_mode: bool = True) -> None:
        self.demo_mode = demo_mode

    def get(self, scenario_name: str) -> Iterator[str]:
        if scenario_name not in self.SCENARIOS:
            raise KeyError(f"Unknown scenario: {scenario_name}")
        for line in self.SCENARIOS[scenario_name]:
            yield line
