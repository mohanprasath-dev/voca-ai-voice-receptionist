from voca.orchestration.turn_manager import INTERRUPT_PRIORITY, TurnManager


def test_interrupt_priority_is_high() -> None:
    assert INTERRUPT_PRIORITY == "high"


def test_turn_manager_interrupts_when_user_speaks_during_tts() -> None:
    manager = TurnManager()

    assert manager.should_interrupt(user_speaking_while_tts=True) is True
    assert manager.should_interrupt(user_speaking_while_tts=False) is False
