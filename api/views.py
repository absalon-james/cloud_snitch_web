import logging

from cloud_snitch.models import registry
from django.http import Http404
from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .serializers import ModelSerializer
from .serializers import PropertySerializer
from .serializers import SearchSerializer
from .serializers import TimesChangedSerializer

from .query import Query
from .query import TimesQuery

logger = logging.getLogger(__name__)


class ModelViewSet(viewsets.ViewSet):

    def list(self, request):
        models = registry.modeldicts()
        serializer = ModelSerializer(models, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        model = registry.modeldict(pk)
        if model is None:
            raise Http404
        serializer = ModelSerializer(model)
        return Response(serializer.data)


class PathViewSet(viewsets.ViewSet):

    def list(self, request):
        paths = {}
        for label, model in registry.models.items():
            paths[label] = [l for l, _ in registry.path(label)]
        serializer = ModelSerializer(paths)
        return Response(serializer.data)


class PropertyViewSet(viewsets.ViewSet):

    def list(self, request, model=None):
        props = registry.properties()
        serializer = PropertySerializer(props)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        props = registry.properties(model=pk)
        if not props:
            raise Http404
        serializer = PropertySerializer(props)
        return Response(serializer.data)


class ObjectViewSet(viewsets.ViewSet):

    @list_route(methods=['post'])
    def times(self, request):

        # Validate input
        times = TimesChangedSerializer(data=request.data)
        if not times.is_valid():
            raise ValidationError(times.errors)
        vd = times.validated_data

        logger.debug("Validated input")

        # Find object by type and identity
        query = Query(vd.get('model')) \
            .identity(vd.get('identity')) \
            .time(vd.get('time'))

        records = query.fetch()
        logger.debug("Searched for object...")
        logger.debug(records)

        # Raise 404 if not found
        if not records:
            raise Http404()

        created_at = records[0][vd.get('model')]['created_at']

        # Build query to get times
        query = TimesQuery(vd.get('model'), vd.get('identity'))
        times = query.fetch()

        if created_at not in times:
            times.append(created_at)

        results = ModelSerializer({
            'data': vd,
            'times': times
        })
        return Response(results.data)

    @list_route(methods=['post'])
    def search(self, request):
        search = SearchSerializer(data=request.data)
        if not search.is_valid():
            raise ValidationError(search.errors)

        vd = search.validated_data
        query = Query(vd.get('model')) \
            .identity(vd.get('identity')) \
            .time(vd.get('time'))

        for f in vd.get('filters', []):
            query.filter(
                f['prop'],
                f['operator'],
                f['value'],
                label=f['model']
            )

        count = query.count()

        records = query.page(page=vd['page'], pagesize=vd['pagesize'])

        serializer = ModelSerializer({
            'query': str(query),
            'data': vd,
            'params': query.params,
            'count': count,
            'pagesize': vd['pagesize'],
            'page': vd['page'],
            'records': records
        })
        return Response(serializer.data)
