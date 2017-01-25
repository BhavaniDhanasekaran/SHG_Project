from django.shortcuts import render,render_to_response
from django.views.decorators import csrf
from   django.views.decorators.csrf  import csrf_protect, csrf_exempt
from django.http import HttpResponseRedirect,HttpResponse,JsonResponse
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
def dsgroupview(request,groupID,loanID):
    username = request.user
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)  
    print "grp:"
    print groups[0]
    return render_to_response( 'ds_groupview.html', {"groupId": groupID,"loanId":loanID,"group":groups[0],"user":username})
    
def dsgroupview2(request):
    print "Inside dsgroupview2(request):"
    username = request.user
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)  
    print "grp:"
    print groups[0]
    return render(request, 'ds_groupview.html',{"group":groups[0],"user":username})  

def groupViewQuery2(request,groupID,loanID):
    username = request.user
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)  
    print "grp:"
    print groups[0]
    return render_to_response( 'queryResponseDS.html', {"groupId": groupID,"loanId":loanID,"group":groups[0],"user":username})
   
def groupViewQuery(request):
    username = request.user
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)  
    print "grp:"
    print groups[0]
    return render(request, 'queryResponseDS.html',{"group":groups[0],"user":username})  


def getGroupData(request,groupID):
    print "Inside getGroupData(request):"
    try:
    	bodyData = { "groupId": groupID} 
    	groupMembersData = sscoreClient._urllib2_request('workflowDetailView/getallmembers', bodyData, requestType='POST')
    	print "groupMembersData"
    	print groupMembersData
        return HttpResponse(json.dumps(groupMembersData), content_type="application/json") 
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while searching group.')

def getIndMemberData(request,memberId,groupId,loanId):
    print "Inside getIndMemberData(request,memberId,groupId):"
    try:
    	bodyData = { "groupId": str(groupId), "memberId":str(memberId),  "loanId": str(loanId), "entityType": "MEMBER","validationType": "PRE","groupIdValLocal": "N",	"groupLocalName": "",	"groupName": "N","userId": "1996" } 
    	IndMemberData = sscoreClient._urllib2_request('workflowDetailView/workflowMemberDetail/', bodyData, requestType='POST')
    	print "IndMemberData"
    	print IndMemberData
        return HttpResponse(json.dumps(IndMemberData), content_type="application/json")

    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while searching group members.')


@csrf_exempt
def getPinCodeDetails(request,pincode):
    print "Inside getPinCodeDetails(request,pincode):"
    try:
    	serialized_data = sscoreClient._urllib2_request('Master/VillageByPincode/'+str(pincode),{},requestType='GET')
    	print "serialized_data"
    	print serialized_data
    	return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting areas under this pincode.')


def creditHistory(request,groupId):
    print "Inside creditHistory(request,groupid):"
    try:
    	bodyData = { "groupId" : str(groupId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/CreditEnquiry', bodyData ,requestType='POST')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while getting Credit History.')


def DocumentView(request,groupId):
    print "Inside DocumentView(request,groupid):"
    try:
    	bodyData = { "groupId" : str(groupId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/GroupDocument', bodyData ,requestType='POST')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while getting Credit History.')
       
@csrf_exempt
def updateKYCDetails(request):
    print "Inside updateKYCDetails(request):"
    try:
	if request.method == "POST":
	    formData  = json.loads(request.body)
	    bodyDataUpdation =  formData["formData"]
	    bodymemberValidation =  formData["memValData"]
	    print "bodymemberValidation"
	    print bodymemberValidation
	    print "bodyDataUpdation"
	    print bodyDataUpdation
			
            memberValResponse = sscoreClient._urllib2_request('workflowEdit/memberValidation',bodymemberValidation,requestType='POST')
            print "memberValResponse"
            print memberValResponse["data"]
            
            if memberValResponse["data"]["status"] != "fail":
                dataUpdateResponse = sscoreClient._urllib2_request('workflowEdit/updateMemberGroupLoan',bodyDataUpdation,requestType='POST')
                print "dataUpdateResponse"
                print dataUpdateResponse
                return HttpResponse(json.dumps(dataUpdateResponse), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while updating the KYC details.')

       
@csrf_exempt
def validateMember(request):
    print "Inside validateMember(request):"
    try:
	if request.method == "POST":
	    formData  = json.loads(request.body)
	    bodymemberValidation =  formData["memValData"]
			
            memberValResponse = sscoreClient._urllib2_request('workflowEdit/memberValidation',bodymemberValidation,requestType='POST')
            print "memberValResponse"
            validationResponse =  memberValResponse["data"]["memberValidationDetail"]
            return HttpResponse(json.dumps(validationResponse), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while updating the KYC details.')

            



