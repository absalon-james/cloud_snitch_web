from base64 import b64encode


def cache_key(args, kwargs, prefix='', index=0):
    """Creates a cache key from args, kwargs, prefix, and an index.

    :param args: Tuple of positional arguments
    :type args: tuple
    :param kwargs: Dictionary of keyword arguments.
    :type kwargs: dict
    :param prefix: String prefixed to key
    :type prefix: str
    :param index: Index in args to start from. Useful for class functions.
    :type index: int
    :returns: Base64 encoded cache key
    :rtype: str
    """
    key = '{}-{}-{}'.format(prefix, args[index:], kwargs)
    key = str.encode(key)
    key = b64encode(key)
    return key
