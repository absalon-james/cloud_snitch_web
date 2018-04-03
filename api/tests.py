import json
import logging
import pprint

from django.test import TestCase

from .diff import Diff
from .tasks import objectdiff


logging.getLogger('neo4j').setLevel(logging.ERROR)
logging.getLogger('api.query').setLevel(logging.ERROR)


class TestDiff(TestCase):

    def test_uservars(self):
        d = Diff(
            'Environment',
            '1-james-osa-aio1',
            1520439341000,
            1522337965000
        )
        node = list(d.nodes['Environment'].values())[0]
        data = node.todict()
        with open('scratch.out', 'w') as f:
            f.write(pprint.pformat(data))
        with open('scratch.json', 'w') as f:
            f.write(json.dumps(data))

    def test_galera(self):
        d = Diff(
            'Host',
            'aio1_galera_container-944df840',
            1520267361000,
            1520440140000
        )
        r = d.result()
        data = r.diffdict
        with open('scratch.out', 'w') as f:
            f.write(pprint.pformat(data))

    def test_objectdiff(self):
        # diff = objectdiff(
        #     'Host',
        #     'aio1_galera_container-944df840',
        #     1520267361000,
        #     1520440140000
        # )
        diff = objectdiff(
            'Environment',
            '1-james-osa-aio1',
            1500267361000,
            1520440140000
        )
        with open('scratch.out', 'w') as f:
            f.write(pprint.pformat(diff.diffdict))
        with open('scratch.json', 'w') as f:
            f.write(json.dumps(diff.diffdict))
