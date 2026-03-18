from voca.api.contracts import Intent
from voca.orchestration.intent_router import IntentRouter


def test_intent_router_fast_path_skips_llm() -> None:
    router = IntentRouter()

    intent, confidence, skip_llm = router.route("Please book appointment tomorrow")

    assert intent == Intent.NEW_APPOINTMENT
    assert confidence > 0.85
    assert skip_llm is True


def test_intent_router_uses_llm_for_ambiguous_input() -> None:
    called = {"value": False}

    def fake_llm_classifier(text: str) -> tuple[Intent, float]:
        called["value"] = True
        return Intent.PRICING_INFO, 0.78

    router = IntentRouter(llm_classifier=fake_llm_classifier)
    intent, confidence, skip_llm = router.route("Can you help me maybe")

    assert called["value"] is True
    assert intent == Intent.PRICING_INFO
    assert confidence == 0.78
    assert skip_llm is False
