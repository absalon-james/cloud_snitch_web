import logging
import time

from neo4j.v1 import GraphDatabase
from django.conf import settings

logger = logging.getLogger(__name__)
_CONNECTION = None

class Connection:

    def __init__(self):
        """Init the connection."""
        self.uri = settings.NEO4J.get('uri')
        self.username = settings.NEO4J.get('username')
        self.password = settings.NEO4J.get('password')
        self.driver = GraphDatabase.driver(
            self.uri,
            auth=(self.username, self.password)
        )
        self.start = time.time()

    def isvalid(self):
        """Check connection age

        :returns: True or False
        :rtype: bool
        """
        # Check that the driver wasn't closed.
        if self.driver is None:
            return False

        # Check connection age
        max_connection_age = settings.NEO4J.get('max_connection_age', 86400)
        if time.time() - self.start > max_connection_age:
            return False
        return True

    def close(self):
        """Close the driver if not closed."""
        if self.driver is not None:
            self.driver.close()
            self.driver = None

    def __del__(self):
        """Close the driver on deletes."""
        self.close()


def get_connection():
    global _CONNECTION
    if _CONNECTION is None or not _CONNECTION.isvalid():
        if _CONNECTION is not None:
            _CONNECTION.close()
            _CONNECTION = None
        _CONNECTION = Connection()
    return _CONNECTION.driver
