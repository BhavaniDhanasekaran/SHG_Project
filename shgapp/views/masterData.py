from django.views.decorators 	import csrf
from django.views.decorators.csrf 	import csrf_protect, csrf_exempt
from django.shortcuts import render,render_to_response
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.http import JsonResponse
from django.conf import settings as django_settings
from shgapp.utils.sscoreclient import SSCoreClient
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *
import json
import urllib2
import requests

helper = Helper()
sscoreClient = SSCoreClient()

@csrf_exempt
def masterDataBank(request):
    print "Inside masterDataBank(request):"
    try:
        serialized_data = sscoreClient._urllib2_request('Master/bankdetail',{},requestType='GET')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while getting master bank details.')

@csrf_exempt
def masterIDProof(request):
    print "Inside masterIDProof(request):"
    try:
        serialized_data = sscoreClient._urllib2_request('Master/idproofdetail',{},requestType='GET')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while getting ID proof master.')

@csrf_exempt
def masterAddressProof(request):
    print "Inside masterAddressProof(request):"
    try:
        serialized_data = sscoreClient._urllib2_request('Master/addressproofdetail',{},requestType='GET')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while Address proof master.')

@csrf_exempt
def masterLoanPurpose(request):
    print "Inside masterLoanPurpose(request):"
    try:
        serialized_data = sscoreClient._urllib2_request('Master/loanpurpose',{},requestType='GET')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while getting loan purpose master.')








    





