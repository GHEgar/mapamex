from datetime import datetime

from app.services.layer_tree_service import _compute_etag

TS = datetime(2026, 7, 16, 8, 0, 0)
WS = [{'alias': 'seg', 'geoserverWorkspace': 'seg', 'dbSchema': 'seg', 'label': 'Seg'}]


class TestComputeEtag:
    def test_same_inputs_same_etag(self):
        a = _compute_etag(TS, 5, ['a', 'b'], WS)
        b = _compute_etag(TS, 5, ['a', 'b'], WS)
        assert a == b

    def test_initial_order_change_changes_etag(self):
        a = _compute_etag(TS, 5, ['a', 'b', 'c'], WS)
        b = _compute_etag(TS, 5, ['a', 'b'], WS)
        assert a != b

    def test_initial_order_reorder_changes_etag(self):
        a = _compute_etag(TS, 5, ['a', 'b'], WS)
        b = _compute_etag(TS, 5, ['b', 'a'], WS)
        assert a != b

    def test_workspaces_change_changes_etag(self):
        a = _compute_etag(TS, 5, ['a'], WS)
        b = _compute_etag(TS, 5, ['a'], [])
        assert a != b

    def test_none_updated_at_supported(self):
        etag = _compute_etag(None, 0, [], [])
        assert etag.startswith('W/"') and etag.endswith('"')
