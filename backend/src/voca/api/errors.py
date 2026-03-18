class VocaError(Exception):
    """Base error for Voca orchestration."""


class SessionOverCapacityError(VocaError):
    """Raised when active session limit is reached."""


class BudgetExceededError(VocaError):
    """Raised when hard budget limits are exceeded."""


class InvalidTurnInputError(VocaError):
    """Raised when a turn payload is invalid."""
