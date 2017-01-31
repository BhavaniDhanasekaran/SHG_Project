from django.views.decorators import csrf
from django.views.decorators.csrf  import csrf_protect, csrf_exempt
from django.template import RequestContext
from django.shortcuts import render,render_to_response
from django.http import HttpResponseRedirect,HttpResponse,JsonResponse
from shgapp.utils.camundaclient import CamundaClient
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *
from django.contrib.auth.decorators import login_required
import json
import urllib2
import requests


helper = Helper()
camundaClient = CamundaClient()

def assignedBMTaskList(request):
    try:
	print "Entering unassignedTaskList(request): view"
	username = request.user
	Grp = request.user.groups.all()
        groups = request.user.groups.values_list('name',flat=True)  
        print "grp:"
        print groups[0]
        groupName = groups[0]
        
        
	processInstancesArr = []
	groupTaskDict 	= {}
	groupTaskData	= []
	
	#grp_body_cont 	   = { "unassigned" : "true" , "candidateGroup" : str(groupName) }    
	grp_body_cont 	   = { "unassigned" : "true" , "candidateGroup" : "CLM_BM" }
	groupTaskList	  = camundaClient._urllib2_request('task?firstResult=0', grp_body_cont, requestType='POST')

	for data in groupTaskList:
	    processInstancesArr.append(data["processInstanceId"])
            groupTaskDict[data["processInstanceId"]] = data
	    
	bodyData = { "processInstanceIdIn": processInstancesArr }  
	taskProVarList	 = camundaClient._urllib2_request('variable-instance?deserializeValues=false', bodyData, requestType='POST')      
	    
	#Process Variable Instance:
	for data in taskProVarList:
	    if data["processInstanceId"] in groupTaskDict:
	        groupTaskDict[data["processInstanceId"]][data["name"] ] = data["value"]
        	
    	#Group Task Assign:	
    	for key in groupTaskDict:
            groupTaskData.append(groupTaskDict[key])
            
        print "Exiting unassignedTaskList(request): view"
    	return render_to_response('ds-tasklist.html', {"groupTaskList" : json.dumps(groupTaskData),"group" :groups[0],"user":username})
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting task details.')
