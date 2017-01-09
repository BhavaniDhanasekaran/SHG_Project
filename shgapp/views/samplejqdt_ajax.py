from django.http import HttpResponse
from django.core import serializers
from django.db import models
#from django.contrib.auth.models import User
from shgapp.models import CustomUser
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings as django_settings
import json
import urllib2
import requests
from shgapp.utils.helper import Helper
from shgapp.utils.camundaclient import CamundaClient
from shgapp.utils.shgexceptions import *

# Create your views here.

helper = Helper()
camundaClient = CamundaClient()

@login_required
def ajax_datatable1list(request):
    userQSet = CustomUser.objects.all() #or any kind of queryset
    userJSONData = serializers.serialize('json', userQSet)
    print 'userJSONData: ', userJSONData
    return HttpResponse(userJSONData, content_type='application/json')

@login_required
def ajax_get_data1(request,id):
    print 'ajax_get_data1 id: ', id
    userObj = CustomUser.objects.filter(pk=id)
    userJSONData = serializers.serialize("json", userObj)
    print 'userJSONData: ', userJSONData
    return HttpResponse(userJSONData, content_type='application/json')

@login_required
@csrf_exempt
def ajax_post_add_data1(request):
    print 'ajax_post_add_data1 request:', request
    username = request.POST['username']
    print 'username: ', username
    email = request.POST['email']
    print 'email: ', email
    data = {
        'user_name': username,
        'email':email
    }
    print 'response json data: ', data
    return JsonResponse(data)

@login_required
@csrf_exempt
def ajax_put_edit_data1(request,id):
    print 'ajax_put_edit_data1 request: ', request
    print 'id: ', id
    username = request.POST['username']
    print 'username: ', username
    email = request.POST['email']
    print 'email: ', email
    data = {
        'user_name': username,
        'email':email
    }
    print 'response json data: ', data
    return JsonResponse(data)

"""
def ajax_task1list(request):
    object_list = [
        {"name": "Assess Verification Report", "assignee": "crmgruser1"},
        {"name": "CIBIL Verfication", "assignee": "crmgruser1"}]    
    print 'ajax_task1list object_list: ', object_list
    return JsonResponse(object_list, safe=False)
"""

@login_required
def ajax_task1list(request):
    print 'ajax_task1list request: ', request
    taskListData = []
    #taskListUrl = django_settings.CAMUNDA_BASE_URL + 'task/'
    #print 'taskListUrl: ', taskListUrl    
    try:
        #taskListRequest = urllib2.Request( taskListUrl )
        #taskListData = json.loads( urllib2.urlopen(taskListRequest).read() )
        taskListData = camundaClient._urllib2_request('task/', {}, requestType='GET')
        #taskListData = camundaClient._request('task/', {}, requestType='GET')
        return JsonResponse(taskListData, safe=False)
    except ShgInvalidRequest, e:
        print 'ShgInvalidRequest e: ', e
        return helper.bad_request('An expected error occurred while getting tasks.')
    #except urllib2.HTTPError as e:
        #print 'urllib2.HTTPError e: ', e    

@login_required        
def ajax_task2list(request):
    print 'ajax_task2list request: ', request
    taskListData = []
    #taskListUrl = django_settings.CAMUNDA_BASE_URL + 'task/'
    #print 'taskListUrl: ', taskListUrl
    try:
        #taskListRequest = requests.get(taskListUrl) #, timeout=0.001
        #taskListData = taskListRequest.json()
        #taskListData = camundaClient._urllib2_request('task/', {}, requestType='GET')
        taskListData = camundaClient._request('task/', {}, requestType='GET')
        return JsonResponse(taskListData, safe=False)
    except ShgInvalidRequest, e:
        print 'ShgInvalidRequest e: ', e
        return helper.bad_request('An expected error occurred while getting tasks.')
    #except requests.exceptions.RequestException as e:
        #print 'RequestException e: ', e

@login_required
def ajax_task3list(request):
    print 'ajax_task3list request: ', request
    taskListData = []
    #taskListUrl = django_settings.CAMUNDA_BASE_URL + 'task/'
    #print 'taskListUrl: ', taskListUrl
    try:
        #taskListRequest = requests.get(taskListUrl) #, timeout=0.001
        #taskListData = taskListRequest.json()
        #taskListData = camundaClient._urllib2_request('task/', {}, requestType='GET')
        taskListData = camundaClient._request('task/', {}, requestType='GET')
        return JsonResponse(taskListData, safe=False)
    except ShgInvalidRequest, e:
        print 'ShgInvalidRequest e: ', e
        return helper.bad_request('An expected error occurred while getting tasks.')
    #except requests.exceptions.RequestException as e:
        #print 'RequestException e: ', e