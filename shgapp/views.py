from django.shortcuts import render,render_to_response
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.core import serializers
from django.db import models
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings as django_settings
import json
import urllib2
import requests


def hello(request):
    return render(request, 'content.html')


def dsdatecount(request):
    return render(request, 'ds-datecount.html')


def dstasklist(request):
    return render(request, 'ds-tasklist.html')

def taskunclaim(request):
    return render(request, 'ds-tasklist-unclaim.html')    


#My task 
def mytask(request):
    return render(request, 'ds-mytask.html')    

#My task 
def dsgroupview2(request):
    return render(request, 'ds_groupview.html')  
    
def groupViewQuery(request):
    return render(request, 'groupViewQuery.html')  


def getGroupData(request):
    print "Inside getGroupData(request):"
    groupData = []
    bodyData = { "groupId": 60116} 
    groupDataURL = 'http://'+django_settings.SANGAMAM_BASE_URL+'/sangamam-core/workflowDetailView/getallmembers'
    #groupDataURL = 'http://'+django_settings.SANGAMAM_BASE_URL+'/sangamam-core/workflowDetailView/workflowGroupDetail'  //New URL for Group
    print 'GroupDataURL: ', groupDataURL    
    try:
        groupDataURLRequest = urllib2.Request( groupDataURL,json.dumps(bodyData) ,headers={'Content-Type': 'application/json'} )
        groupData = json.loads( urllib2.urlopen(groupDataURLRequest).read() )
        return HttpResponse(json.dumps(groupData), content_type="application/json")
    except urllib2.HTTPError as e:
        print 'urllib2.HTTPError e: ', e


def getIndMemberData(request,memberId,groupId):
    print "Inside getIndMemberData(request,memberId,groupId):"
    IndMemberData = []
    bodyData = { "groupId": str(groupId), "memberId":str(memberId),	"loanId": "82924", "entityType": "MEMBER","validationType": "PRE","groupIdValLocal": "N",	"groupLocalName": "",	"groupName": "N","userId": "1996" } 
    IndMemberDataURL = 'http://'+django_settings.SANGAMAM_BASE_URL+'/sangamam-core/workflowDetailView/workflowMemberDetail/'
    print 'IndMemberDataURL: ', IndMemberDataURL    
    try:
        IndMemberDataURLRequest = urllib2.Request( IndMemberDataURL,json.dumps(bodyData) ,headers={'Content-Type': 'application/json'} )
        IndMemberData = json.loads( urllib2.urlopen(IndMemberDataURLRequest).read() )
        print IndMemberData
        return HttpResponse(json.dumps(IndMemberData), content_type="application/json")

    except urllib2.HTTPError as e:
        print 'urllib2.HTTPError e: ', e


def getPinCodeDetails(request,pincode):
    print "Inside getPinCodeDetails(request,pincode):"
    url = 'http://'+django_settings.SANGAMAM_BASE_URL+'/sangamam-core/Master/VillageByPincode/'+str(pincode)
    try:
	request1    = urllib2.Request(url)
	request1.add_header('Content-Type', 'application/json')
	result	    = urllib2.urlopen(request1)
	serialized_data = result.read()  
    	print "serialized_data"
    	print serialized_data
    	return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except Exception as e:
    	return HttpResponse(json.dumps({"message":"Failed"}), content_type="application/json")
    	
def masterDataBank(request):
    print "Inside masterDataBank(request):"
    url = 'http://'+django_settings.SANGAMAM_BASE_URL+'/sangamam-core/Master/bankdetail'
    try:
	request1    = urllib2.Request(url)
	request1.add_header('Content-Type', 'application/json')
	result	    = urllib2.urlopen(request1)
	serialized_data = result.read()  
    	return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except Exception as e:
    	return HttpResponse(json.dumps({"message":"Failed"}), content_type="application/json")  	
  
def masterIDProof(request):
    print "Inside masterIDProof(request):"
    idProofURL = 'http://'+django_settings.SANGAMAM_BASE_URL+'/sangamam-core/Master/idproofdetail'
    try:
	request1    = urllib2.Request(idProofURL)
	request1.add_header('Content-Type', 'application/json')
	result	    = urllib2.urlopen(request1)
	serialized_data = json.loads(result.read())
    	return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except Exception as e:
    	return HttpResponse(json.dumps({"message":"Failed"}), content_type="application/json")  	
    	
def masterAddressProof(request):
    print "Inside masterAddressProof(request):"
    idProofURL = 'http://'+django_settings.SANGAMAM_BASE_URL+'/sangamam-core/Master/addressproofdetail'
    try:
	request1    = urllib2.Request(idProofURL)
	request1.add_header('Content-Type', 'application/json')
	result	    = urllib2.urlopen(request1)
	serialized_data = json.loads(result.read())
    	return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except Exception as e:
    	return HttpResponse(json.dumps({"message":"Failed"}), content_type="application/json")  
  
def masterLoanPurpose(request):
    print "Inside masterLoanPurpose(request):"
    loanPurposeURL = 'http://'+django_settings.SANGAMAM_BASE_URL+'/sangamam-core/Master/loanpurpose'
    try:
	request1    = urllib2.Request(loanPurposeURL)
	request1.add_header('Content-Type', 'application/json')
	result	    = urllib2.urlopen(request1)
	serialized_data = json.loads(result.read())
    	return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except Exception as e:
    	return HttpResponse(json.dumps({"message":"Failed"}), content_type="application/json")  
    
    








