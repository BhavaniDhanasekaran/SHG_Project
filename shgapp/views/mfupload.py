import time
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views import View
import boto3
import os
from django.conf import settings
import random
import string
import mimetypes
from django.utils.timezone import now as timezone_now
from django.contrib.auth.decorators import login_required
from shgapp.utils.helper import Helper
from shgapp.views.decorator import session_required

helper = Helper()
s3Resource = boto3.resource('s3',
                            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                            region_name=settings.AWS_REGION_NAME)
print 's3 resource: ', s3Resource


def create_random_string(length=30):
    if length <= 0:
        length = 30

    symbols = string.ascii_lowercase + string.ascii_uppercase + string.digits
    return ''.join([random.choice(symbols) for x in range(length)])


def upload_to_filename(filename):
    now = timezone_now()
    filename_base, filename_ext = os.path.splitext(filename)
    return '{}_{}{}'.format(
        #now.strftime("%Y/%m/%d/%Y%m%d%H%M%S"),
        now.strftime("%Y%m%d%H%M%S"),
        create_random_string(),
        filename_ext.lower()
    )

@session_required
def ajax_progress_bar_upload(request):
    print "called ajax_progress_bar_upload"
    print 'request: ', request
    time.sleep(1)
    try:
        for filename, file in request.FILES.iteritems():
            name = request.FILES[filename].name
            uploadtofilename = upload_to_filename(request.FILES[filename].name)
            ctype = mimetypes.guess_type(uploadtofilename)
            file_size = file.size
            print 'name: ', name
            print 'upload_to_filename name: ', uploadtofilename
            print 'content type: ', mimetypes.guess_type(uploadtofilename)
            s3Resource.Bucket(settings.AWS_BUCKET_NAME).put_object(
                Key=settings.AWS_BUCKET_FOLDER_PATH + uploadtofilename,
                Body=file,ContentType=ctype[0])
            print  'ProgressBarUploadView done - upload_to_filename', uploadtofilename
            data = {'is_valid': True, 'name': uploadtofilename, 'url': settings.AWS_S3_BASE_URL + uploadtofilename,'file_size':file_size}
    except Exception, e:
        print 'ajax_progress_bar_upload Exception e: ', e
        data = {'is_valid': False}
        return helper.bad_request('Unexpected error occurred while uploading document.')
    print 'data: ', data
    return JsonResponse(data)


