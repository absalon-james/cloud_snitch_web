from cloud_snitch.models import registry
from django.http import Http404
from rest_framework import viewsets
from rest_framework.decorators import detail_route
from rest_framework.decorators import list_route
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .serializers import DetailSerializer
from .serializers import ModelSerializer
from .serializers import PropertySerializer
from .serializers import SearchSerializer

from .query import Query


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

    @detail_route(methods=['post'])
    def detail(self, request):
        detail = DetailSerilizer(data=request.data)
        if not detail.is_valid():
            raise ValidationError(detail.errors)

        vd = detail.validated_data
        query = Query(vd.get('model')) \
            .identity(vd.get('identity')) \
            .time(vd.get('time'))
        resp = query.fetch_one()
