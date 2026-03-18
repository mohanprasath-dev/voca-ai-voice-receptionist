from voca.orchestration.turn_manager import EARLY_RESPONSE_MODE, TurnManager


def test_early_response_mode_enabled() -> None:
    assert EARLY_RESPONSE_MODE is True


def test_partial_stt_triggers_early_response_when_confident() -> None:
    manager = TurnManager()

    assert manager.should_start_early_response(is_partial=True, confidence=0.8) is True
    assert manager.should_start_early_response(is_partial=True, confidence=0.5) is False
    assert manager.should_start_early_response(is_partial=False, confidence=0.95) is False
