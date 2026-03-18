from voca.demo.scenario_engine import DemoScenarioEngine


def test_scenario_engine_is_deterministic() -> None:
    engine = DemoScenarioEngine(demo_mode=True)

    flow_one = list(engine.get("normal_booking"))
    flow_two = list(engine.get("normal_booking"))

    assert flow_one == flow_two
    assert len(flow_one) >= 2
