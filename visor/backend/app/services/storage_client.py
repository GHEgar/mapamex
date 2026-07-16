from typing import Optional

import boto3
from botocore.client import Config

from app.config import settings


_presign_client = None


def _get_presign_client():
    global _presign_client
    if _presign_client is None:
        if not (settings.STORAGE_ACCESS_KEY and settings.STORAGE_SECRET_KEY):
            return None
        endpoint = settings.STORAGE_PUBLIC_ENDPOINT or settings.STORAGE_ENDPOINT
        if not endpoint:
            return None
        _presign_client = boto3.client(
            's3',
            endpoint_url=endpoint,
            aws_access_key_id=settings.STORAGE_ACCESS_KEY,
            aws_secret_access_key=settings.STORAGE_SECRET_KEY,
            region_name='us-east-1',
            config=Config(signature_version='s3v4'),
        )
    return _presign_client


def presign_get(object_key: str, ttl_seconds: Optional[int] = None) -> Optional[str]:
    client = _get_presign_client()
    if client is None:
        return None
    ttl = ttl_seconds if ttl_seconds is not None else settings.STORAGE_PRESIGN_TTL_SECONDS
    return client.generate_presigned_url(
        'get_object',
        Params={'Bucket': settings.STORAGE_BUCKET, 'Key': object_key},
        ExpiresIn=ttl,
    )
