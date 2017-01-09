from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseForbidden
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.conf import settings as django_settings
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
import urllib2
import requests
from shgapp.utils.helper import Helper
from shgapp.utils.sscoreclient import SSCoreClient
from shgapp.utils.shgexceptions import *

# Create your views here.

helper = Helper()
sscoreClient = SSCoreClient()

@login_required
def group_members1(request):    
    return render(request, 'groupmembersample/groupmembers1.html')

@login_required
@csrf_exempt
def ajax_post_group_members1(request):
    print 'ajax_post_group_members1 request:', request
    
    #helper = Helper()
    #sscoreClient = SSCoreClient()
    
    groupId = request.POST['groupid']
    print 'groupId: ', groupId
    requestData = {
        'groupId': groupId
    }
    print 'requestData: ', requestData
    
    groupMembersData = {}
    #groupMembersUrl = django_settings.SSCORE_BASE_URL + 'workflowDetailView/getallmembers/'
    #print 'groupMembersUrl: ', groupMembersUrl    
    try:
        #groupMembersRequest = urllib2.Request( groupMembersUrl, json.dumps(requestData), headers = { 'Content-Type' : 'application/json' } )
        #groupMembersData = json.loads( urllib2.urlopen(groupMembersRequest).read() )
        #groupMembersData = sscoreClient._urllib2_request('workflowDetailView/getallmembers/', requestData, requestType='POST')
        groupMembersData = sscoreClient._request('workflowDetailView/getallmembers/', requestData, requestType='POST')
        return JsonResponse(groupMembersData, safe=False)
    except ShgInvalidRequest, e:
        print 'ajax_post_group_members1 ShgInvalidRequest e: ', e
        return helper.bad_request('An expected error occurred while searching group members.')
    #except urllib2.HTTPError as e:
        #print 'urllib2.HTTPError e: ', e        
    #except Exception, e:        
        #print 'Exception e: ', e
        #response = HttpResponse(json.dumps({'message': 'An expected error occurred while searching group members.'}), content_type='application/json')
        #response.status_code = 400
        #return response
        #return bad_request('An expected error occurred while searching group members.')
        #return helper.bad_request('An expected error occurred while searching group members.')

@login_required
@csrf_exempt
def ajax_post_group_member1(request):
    print 'ajax_post_group_member1 request:', request
    
    #helper = Helper()
    #sscoreClient = SSCoreClient()
    
    groupId = request.POST['groupid']
    print 'groupId: ', groupId
    memberId = request.POST['memberid']
    print 'memberId: ', memberId
    requestData = {
        'groupId': groupId,
        "loanId": "82924",
        'memberId': memberId,
        'entityType': 'MEMBER',
        'validationType': 'PRE',
        "groupLocalName": "",
	    "groupName": "N",
	    "userId": "1996"
    }
    print 'requestData: ', requestData
    
    groupMemberData = {}
    #groupMemberUrl = django_settings.SSCORE_BASE_URL + 'workflowDetailView/workflowMemberDetail/'
    #print 'groupMemberUrl: ', groupMemberUrl    
    try:
        #groupMemberRequest = urllib2.Request( groupMemberUrl, json.dumps(requestData), headers = { 'Content-Type' : 'application/json' } )
        #groupMemberData = json.loads( urllib2.urlopen(groupMemberRequest).read() )
        #groupMemberData = sscoreClient._urllib2_request('workflowDetailView/workflowMemberDetail/', requestData, requestType='POST')
        groupMemberData = sscoreClient._request('workflowDetailView/workflowMemberDetail/', requestData, requestType='POST')
        return JsonResponse(groupMemberData, safe=False)
    except ShgInvalidRequest, e:
        print 'ajax_post_group_member1 ShgInvalidRequest e: ', e
        return helper.bad_request('An expected error occurred while getting group member. memberId: ' + memberId)
    #except urllib2.HTTPError as e:
        #print 'urllib2.HTTPError e: ', e
    #except Exception, e:        
        #print 'Exception e: ', e
        #response = HttpResponse(json.dumps({'message': 'An expected error occurred while searching group members.'}), content_type='application/json')
        #response.status_code = 400
        #return response        
        #return bad_request('An expected error occurred while getting group member. memberId: ' + memberId)
        #return helper.bad_request('An expected error occurred while getting group member. memberId: ' + memberId)

"""
def bad_request(message):
    response = HttpResponse(json.dumps({'message': message}), content_type='application/json')
    response.status_code = 400
    return response
"""    