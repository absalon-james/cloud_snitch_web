from neo4j.v1 import GraphDatabase
from django.conf import settings


def withgraphdb(func):

    def new_func(*args, **kwargs):
        try:
            driver = GraphDatabase.driver(
                settings.NEO4J.get('uri'),
                auth=(
                    settings.NEO4J.get('username'),
                    settings.NEO4J.get('password')
                )
            )
            with driver.session() as session
                kwargs['_session'] = session
                return func(*args, **kwargs)
        finally:
            driver.close()

    return new_func
