from django.shortcuts import render
#from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.conf import settings as django_settings
import json
import urllib2
import requests
from shgapp.utils.helper import Helper
from shgapp.utils.camundaclient import CamundaClient
from shgapp.utils.shgexceptions import *
from shgapp.acl import *
from shgapp.acl_decorators import role_required

# Create your views here.

helper = Helper()
camundaClient = CamundaClient()

@login_required
# decorator check before processing the request.
@role_required(ROLE2, ROLE3)
def datatable1(request):    
    return render(request, 'samplejqdt/datatable1.html')

@login_required
def add_data1(request):    
    return render(request, 'samplejqdt/adddata1.html')

@login_required
def edit_data1(request,id):
    print 'edit_data1 id: ', id
    data = {
        'pkid': id
    }
    return render(request, 'samplejqdt/editdata1.html', data)

@login_required
def task1list(request):    
    return render(request, 'tasklistsamplejqdt/task1list.html')

@login_required
def task2list(request):    
    return render(request, 'tasklistsamplejqdt/task2list.html')

@login_required
def task3list(request):    
    return render(request, 'tasklistsamplejqdt/task3list.html')

@login_required
def task4list(request):    
    print 'task4list request: ', request
    taskListData = []
    #taskListUrl = django_settings.CAMUNDA_BASE_URL + 'task/'
    #print 'taskListUrl: ', taskListUrl    
    try:
        #taskListRequest = urllib2.Request( taskListUrl, headers = { 'Content-Type' : 'application/json' } )
        #taskListData = json.loads( urllib2.urlopen(taskListRequest).read() )
        #taskListData = camundaClient._urllib2_request('task/', {}, requestType='GET')
        taskListData = camundaClient._request('task/', {}, requestType='GET')
    except ShgInvalidRequest, e:
        print 'ShgInvalidRequest e: ', e
        return helper.bad_request('An expected error occurred while getting tasks.')
    #except urllib2.HTTPError as e:
        #print 'task4list urllib2.HTTPError: ', e
    
    #print 'taskListData: ', taskListData
    data_task_list = { 'taskList': json.dumps(taskListData, encoding='utf-8') }
    #print 'data_task_list: ', data_task_list
    return render(request, 'tasklistsamplejqdt/task4list.html', data_task_list )