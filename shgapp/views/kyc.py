from django.views.decorators import csrf
from   django.views.decorators.csrf 	import csrf_protect, csrf_exempt
from django.shortcuts import render,render_to_response
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.http import JsonResponse
from django.conf import settings as django_settings
from shgapp.utils.sscoreclient import SSCoreClient
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *
from django.template  import loader, RequestContext
import json
import urllib2
import requests

helper = Helper()
sscoreClient = SSCoreClient()

@csrf_exempt
def dsgroupview(request,groupID,loanID):
    return render_to_response( 'ds_groupview.html', {"groupId": groupID,"loanId":loanID})
    
def dsgroupview2(request):
    print "Inside dsgroupview2(request):"
    return render(request, 'ds_groupview.html')  

def groupViewQuery2(request,groupID,loanID):
    return render_to_response( 'queryResponseDS.html', {"groupId": groupID,"loanId":loanID})
   
def groupViewQuery(request):
    return render(request, 'queryResponseDS.html')  


def getGroupData(request,groupID):
    print "Inside getGroupData(request):"
    try:
    	#context      = RequestContext(request)
    	bodyData = { "groupId": groupID} 
    	groupMembersData = sscoreClient._urllib2_request('workflowDetailView/getallmembers', bodyData, requestType='POST')
    	print "groupMembersData"
    	print json.dumps(groupMembersData)
    	#context.memberInfo = json.dumps(groupMembersData)
        return HttpResponse(json.dumps(groupMembersData), content_type="application/json") 
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while searching group.')


def getIndMemberData(request,memberId,groupId,loanId):
    print "Inside getIndMemberData(request,memberId,groupId):"
    try:
    	bodyData = { "groupId": str(groupId), "memberId":str(memberId),  "loanId": str(loanId), "entityType": "MEMBER","validationType": "PRE","groupIdValLocal": "N",	"groupLocalName": "",	"groupName": "N","userId": "1996" } 
    	IndMemberData = sscoreClient._urllib2_request('workflowDetailView/workflowMemberDetail/', bodyData, requestType='POST')
    	print "IndMemberData"
    	print IndMemberData
        return HttpResponse(json.dumps(IndMemberData), content_type="application/json")

    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while searching group members.')


def getPinCodeDetails(request,pincode):
    print "Inside getPinCodeDetails(request,pincode):"
    try:
    	serialized_data = sscoreClient._urllib2_request('Master/VillageByPincode/'+str(pincode),{},requestType='GET')
    	return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while getting areas under this pincode.')

