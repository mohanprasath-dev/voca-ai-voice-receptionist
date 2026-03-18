from voca.orchestration.response_composer import ResponseComposer


def test_multilingual_segmentation_keeps_mixed_language_tokens() -> None:
    composer = ResponseComposer()

    segments = composer.segment_multilingual("Hello kal 5 baje")

    langs = [segment["lang"] for segment in segments]
    texts = [segment["text"] for segment in segments]

    assert texts == ["Hello", "kal", "5", "baje"]
    assert langs == ["en", "hi", "en", "hi"]
