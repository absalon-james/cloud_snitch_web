from cloud_snitch.models import registry

from rest_framework.serializers import BaseSerializer
from rest_framework.serializers import Serializer

from rest_framework.serializers import ChoiceField
from rest_framework.serializers import CharField
from rest_framework.serializers import IntegerField
from rest_framework.serializers import ListField
from rest_framework.serializers import SlugField

from rest_framework.serializers import ValidationError


_operators = [
    '=',
    '<>',
    '>',
    '>=',
    '<',
    '<=',
    'CONTAINS',
    'STARTS WITH',
    'ENDS WITH'
]

class ModelSerializer(BaseSerializer):
    """Debug serializer for dicts"""
    def to_representation(self, obj):
        """Get dict repr

        :param obj: Dict to represent
        :type obj: dict
        :returns: Dict representation
        :rtype: dict
        """
        return obj


class PropertySerializer(BaseSerializer):
    """Serializer for list of properties."""
    def to_representation(self, obj):
        """Dict representation.

        :param obj: List of properties
        :type obj: list
        :returns: Dict representation
        :rtype dict
        """
        return dict(properties=obj)


class FilterSerializer(Serializer):
    """Serializer for filters on a query"""
    prop = SlugField(max_length=256, required=True)
    operator = ChoiceField(_operators, required=True)
    value = CharField(max_length=256, required=True)


class SearchSerializer(Serializer):
    """Serializer for search queries."""
    model = ChoiceField([m.label for m in registry.models.values()])
    time = IntegerField(min_value=0, required=False)
    identity = CharField(max_length=256, required=False)
    filters = ListField(child=FilterSerializer(), required=False)

    page = IntegerField(min_value=0, required=False, default=1)
    pagesize = IntegerField(min_value=1, required=False, default=500)

    def validate(self, data):
        props = registry.properties(data['model'])
        for f in data.get('filters', []):
            if f['prop'] not in props:
                raise ValidationError(
                    'Model {} does not have property {}'.format(
                        data['model'],
                        f['prop']
                    )
                )
        return data


class DetailSerializer(Serializer):
    """Serializer for detailed query of one object."""
    model = ChoiceField([m.label for m in registry.models.values()])
    time = IntegerField(min_value=0, required=False)
    identity = CharField(max_length=256, required=True)
