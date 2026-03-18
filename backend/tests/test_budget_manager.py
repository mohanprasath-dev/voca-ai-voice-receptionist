from voca.services.budget_manager import BudgetManager


def test_budget_mode_transitions() -> None:
    manager = BudgetManager()

    assert manager.current_mode() == "normal"

    manager.record_characters(85_000)
    assert manager.current_mode() == "near_limit"

    manager.record_characters(20_000)
    assert manager.current_mode() == "hard_limit"
