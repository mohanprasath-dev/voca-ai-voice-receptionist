from voca.api.contracts import Intent
from voca.orchestration.slot_filler import SlotFiller


def test_slot_filler_extracts_date_time_and_service_type() -> None:
    filler = SlotFiller()

    slots = filler.extract(Intent.NEW_APPOINTMENT, "Please book consultation tomorrow at 5 pm")

    assert slots["date"] == "tomorrow"
    assert "5" in slots["time"]
    assert slots["service_type"] == "consultation"


def test_slot_filler_missing_required_fields() -> None:
    filler = SlotFiller()

    missing = filler.missing_required(Intent.NEW_APPOINTMENT, {"date": "tomorrow"})

    assert missing == ["time"]
