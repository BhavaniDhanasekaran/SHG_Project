import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

print "BASE_DIR"
print BASE_DIR

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'j(eizq_b!dk+rse4!94x5$caj3dux31ks*xj8im(c&jpbkomud'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']
import time
from datetime import datetime
JS_VERSION  = time.time()


# Application definition

INSTALLED_APPS = [
    'shgapp',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    #'urlcrypt',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
]

RUNNING_TESTS = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_AGE = 30 * 60 #
SESSION_SAVE_EVERY_REQUEST = True
ROOT_URLCONF = 'shg.urls'
SESSION_IDLE_TIMEOUT = 20 * 60
SESSION_SERIALIZER = 'django.contrib.sessions.serializers.PickleSerializer'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'shgapp.template_context_processors.global_settings_context_processors',
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


WSGI_APPLICATION = 'shg.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.10/ref/settings/#databases

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

'''

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'shg_test_django',
        'USER': 'postgres',
        'PASSWORD': 'G6j88U2JYzcwpjPq',
        'HOST': 'madurabpm.cwxetrwsi128.ap-southeast-1.rds.amazonaws.com',
        'PORT': '5432',
    }
}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'shgdb',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}

'''

# Password validation
# https://docs.djangoproject.com/en/1.10/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.10/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Kolkata'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.10/howto/static-files/

STATIC_URL = '/static/'

LOGIN_URL = '/signin/'
LOGIN_REDIRECT_URL = '/signin/'
LOGOUT_URL = '/signout/'

STATIC_ROOT = 'staticfiles'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
    '/var/www/static/',
]

CAMUNDA_BASE_URL = 'http://13.228.10.151:8089/engine-rest/'
SSCORE_BASE_URL = 'http://13.228.10.151:8086/sangamam-core/'

#CAMUNDA_BASE_URL = 'http://52.221.13.230:8086/engine-rest/'
#SSCORE_BASE_URL = 'http://52.221.14.215:8085/sangamam-core/'

#CAMUNDA_BASE_URL = 'http://192.168.1.28:8086/engine-rest/'
#SSCORE_BASE_URL = 'http://192.168.1.71:8085/sangamam-core/'

AWS_ACCESS_KEY_ID='AKIAJKJDLQNPXRK4NJPQ'
AWS_SECRET_ACCESS_KEY='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'

AWS_REGION_NAME='ap-southeast-1'
AWS_BUCKET_NAME = 'testingdocuments.mmfl.in'
AWS_BUCKET_FOLDER_PATH = 'media/doc_data/documents/'
AWS_S3_BASE_URL='http://testingdocuments.mmfl.in.s3.amazonaws.com/media/doc_data/documents/'



LOGGING = {
    'version': 1,
    'formatters': {
        'verbose': {
            'format' : "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
            'datefmt' : "%d/%b/%Y %H:%M:%S"
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'filters': ['require_debug_true'],
            'class': 'logging.StreamHandler',
        },
        'null': {
            'class': 'logging.NullHandler',
        },
        'log_file':{
            'level': 'DEBUG',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': os.path.join('/opt/shgbpm/shgdjango_logs/', 'djangoLog.log'),
            'when': 'midnight',
            'backupCount': 15,
            'formatter': 'verbose'
        },
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler',
            'include_html': True,
            
        }
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
        },
        'shgapp.views': {
            'handlers': ['console','log_file'],
         },
        'dba': {
            'handlers': ['console','log_file'],
        },
        'django': {
            'handlers': ['console','log_file'],
        },
        'py.warnings': {
            'handlers': ['console','log_file'],
        },
	 
        
    }
}