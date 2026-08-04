"""Tests del campo cve_ent en schemas de layer y su validacion de dominio.

Cubren la normalizacion Pydantic (entrada camelCase `cveEnt`, cadena vacia a
None, regex de claves INEGI 01-32) y la regla de servicio que restringe
cve_ent a nodos de tipo 'tema'.
"""
from unittest.mock import MagicMock

import pytest
from pydantic import ValidationError

from app.models.layer import Layer
from app.schemas.layer import LayerCreate, LayerUpdate
from app.services.layer_service import create_layer, update_layer


def _create_payload(**overrides):
    payload = {'id': 'tema-prueba', 'label': 'Tema de prueba', 'nodeType': 'tema'}
    payload.update(overrides)
    return payload


class TestLayerCreateCveEnt:
    def test_accepts_camel_case_input(self):
        data = LayerCreate.model_validate(_create_payload(cveEnt='14'))
        assert data.cve_ent == '14'

    def test_accepts_snake_case_input(self):
        data = LayerCreate.model_validate(_create_payload(cve_ent='14'))
        assert data.cve_ent == '14'

    def test_empty_string_normalized_to_none(self):
        data = LayerCreate.model_validate(_create_payload(cveEnt=''))
        assert data.cve_ent is None

    def test_default_is_none(self):
        data = LayerCreate.model_validate(_create_payload())
        assert data.cve_ent is None

    @pytest.mark.parametrize('value', ['99', '1', '33', '00'])
    def test_rejects_invalid_values(self, value):
        with pytest.raises(ValidationError, match='cve_ent invalido'):
            LayerCreate.model_validate(_create_payload(cveEnt=value))

    def test_serializes_as_camel_case(self):
        data = LayerCreate.model_validate(_create_payload(cveEnt='24'))
        assert data.model_dump(by_alias=True)['cveEnt'] == '24'


class TestLayerUpdateCveEnt:
    def test_accepts_camel_case_input(self):
        data = LayerUpdate.model_validate({'cveEnt': '14'})
        assert data.cve_ent == '14'

    def test_accepts_snake_case_input(self):
        data = LayerUpdate.model_validate({'cve_ent': '14'})
        assert data.cve_ent == '14'

    def test_empty_string_normalized_to_none(self):
        data = LayerUpdate.model_validate({'cveEnt': ''})
        assert data.cve_ent is None
        assert 'cve_ent' in data.model_dump(exclude_unset=True)

    @pytest.mark.parametrize('value', ['99', '1', '33', '00'])
    def test_rejects_invalid_values(self, value):
        with pytest.raises(ValidationError, match='cve_ent invalido'):
            LayerUpdate.model_validate({'cveEnt': value})


class TestCveEntDomainValidation:
    def test_create_rejects_cve_ent_on_non_tema(self):
        data = LayerCreate.model_validate(
            _create_payload(nodeType='category', cveEnt='14')
        )
        with pytest.raises(ValueError, match="nodos de tipo 'tema'"):
            create_layer(
                MagicMock(), data, updated_by='test@test.com',
                skip_geoserver_validation=True,
            )

    def test_create_accepts_cve_ent_on_tema(self):
        data = LayerCreate.model_validate(_create_payload(cveEnt='14'))
        layer = create_layer(
            MagicMock(), data, updated_by='test@test.com',
            skip_geoserver_validation=True,
        )
        assert layer.cve_ent == '14'
        assert layer.node_type == 'tema'

    def test_update_rejects_cve_ent_on_non_tema(self):
        layer = Layer(id='cat-1', label='Categoria', node_type='category')
        data = LayerUpdate.model_validate({'cveEnt': '14'})
        with pytest.raises(ValueError, match="nodos de tipo 'tema'"):
            update_layer(
                MagicMock(), layer, data, updated_by='test@test.com',
                skip_geoserver_validation=True,
            )

    def test_update_rejects_demoting_tema_with_cve_ent(self):
        layer = Layer(id='tema-1', label='Tema', node_type='tema', cve_ent='14')
        data = LayerUpdate.model_validate({'nodeType': 'category'})
        with pytest.raises(ValueError, match="nodos de tipo 'tema'"):
            update_layer(
                MagicMock(), layer, data, updated_by='test@test.com',
                skip_geoserver_validation=True,
            )

    def test_update_sets_cve_ent_on_tema(self):
        layer = Layer(id='tema-1', label='Tema', node_type='tema')
        data = LayerUpdate.model_validate({'cveEnt': '24'})
        updated = update_layer(
            MagicMock(), layer, data, updated_by='test@test.com',
            skip_geoserver_validation=True,
        )
        assert updated.cve_ent == '24'

    def test_update_clears_cve_ent_with_empty_string(self):
        layer = Layer(id='tema-1', label='Tema', node_type='tema', cve_ent='14')
        data = LayerUpdate.model_validate({'cveEnt': ''})
        updated = update_layer(
            MagicMock(), layer, data, updated_by='test@test.com',
            skip_geoserver_validation=True,
        )
        assert updated.cve_ent is None
