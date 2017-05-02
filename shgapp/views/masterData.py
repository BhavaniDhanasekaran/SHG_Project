from django.views.decorators import csrf
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.shortcuts import render, render_to_response
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.http import JsonResponse
from django.conf import settings as django_settings
from shgapp.utils.sscoreclient import SSCoreClient
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *
import json

import logging
logging.basicConfig(level=logging.INFO)
loggerInfo = logging.getLogger(__name__)

logging.basicConfig(level=logging.ERROR)
errorLog = logging.getLogger(__name__)

helper = Helper()
sscoreClient = SSCoreClient()


@csrf_exempt
def masterDataBank(request):
    loggerInfo.info('------------------Entering masterDataBank(request):---------------------- ')
    try:
        serialized_data = sscoreClient._urllib2_request('Master/bankdetail', {}, requestType='GET')
        loggerInfo.info('------------------Exiting masterDataBank(request):---------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised in masterDataBank(request): %s" %e)
        return helper.bad_request('An expected error occurred while getting master bank details.')


@csrf_exempt
def masterIDProof(request):
    loggerInfo.info('------------------Entering masterIDProof(request):---------------------- ')
    try:
        serialized_data = sscoreClient._urllib2_request('Master/idproofdetail', {}, requestType='GET')
        loggerInfo.info('------------------Exiting masterIDProof(request):---------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised in masterIDProof(request):  %s" %e)        
        return helper.bad_request('An expected error occurred while getting ID proof master.')


@csrf_exempt
def masterAddressProof(request):
    loggerInfo.info('------------------Entering masterAddressProof(request):---------------------- ')
    try:
        serialized_data = sscoreClient._urllib2_request('Master/addressproofdetail', {}, requestType='GET')
        loggerInfo.info('------------------Exiting masterAddressProof(request):---------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised in masterAddressProof(request):  %s" %e)        
        return helper.bad_request('An expected error occurred while Address proof master.')


@csrf_exempt
def masterLoanPurpose(request):
    loggerInfo.info('------------------Entering masterLoanPurpose(request):---------------------- ')
    try:
        serialized_data = sscoreClient._urllib2_request('Master/loanpurpose', {}, requestType='GET')
        loggerInfo.info('------------------Exiting masterLoanPurpose(request):---------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised in masterLoanPurpose(request):  %s" %e)        
        return helper.bad_request('An expected error occurred while getting loan purpose master.')

