from .base import *

DEBUG = False

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'shgui',
        'USER': 'webappuser',
        'PASSWORD': 'TGgE6HfvppnXcUVD',
        'HOST': 'webapp.cwxetrwsi128.ap-southeast-1.rds.amazonaws.com',
        'PORT': '5432',
    }
}

CAMUNDA_BASE_URL = 'http://52.221.76.200:8086/engine-rest/'
SSCORE_BASE_URL = 'http://52.74.196.75:8085/sangamam-core/'

AWS_ACCESS_KEY_ID='AKIAJKJDLQNPXRK4NJPQ'
AWS_SECRET_ACCESS_KEY='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'

AWS_REGION_NAME='ap-southeast-1'
AWS_BUCKET_NAME = 'documents.mmfl.in'
AWS_BUCKET_FOLDER_PATH = 'media/doc_data/documents/'
AWS_S3_BASE_URL='http://documents.mmfl.in.s3.amazonaws.com/media/doc_data/documents/'