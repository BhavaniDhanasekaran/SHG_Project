from .base import *

DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'dev_shg_django',
        'USER': 'sangamam',
        'PASSWORD': 'madura123',
        'HOST': 'devsangamam.cwxetrwsi128.ap-southeast-1.rds.amazonaws.com',
        'PORT': '5432',
    }
}

#CAMUNDA_BASE_URL = 'http://13.228.10.151:8089/engine-rest/'
#SSCORE_BASE_URL = 'http://13.228.10.151:8086/sangamam-core/'

CAMUNDA_BASE_URL = 'http://52.221.13.230:8086/engine-rest/'
SSCORE_BASE_URL = 'http://52.221.14.215:8085/sangamam-core/'

AWS_ACCESS_KEY_ID='AKIAJKJDLQNPXRK4NJPQ'
AWS_SECRET_ACCESS_KEY='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'

AWS_REGION_NAME='ap-southeast-1'
AWS_BUCKET_NAME = 'testingdocuments.mmfl.in'
AWS_BUCKET_FOLDER_PATH = 'media/doc_data/documents/'
AWS_S3_BASE_URL='http://testingdocuments.mmfl.in.s3.amazonaws.com/media/doc_data/documents/'