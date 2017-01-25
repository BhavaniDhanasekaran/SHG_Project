from django.views.decorators 	import csrf
from django.template import RequestContext
from django.shortcuts import render,render_to_response
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.conf import settings as django_settings
from shgapp.utils.camundaclient import CamundaClient
from django.contrib.auth.models import User
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *
from django.contrib.auth.decorators import login_required
import json
import urllib2
import requests


helper = Helper()
camundaClient = CamundaClient()


def unassignedTaskList(request):
    try:
	print "Inside unassignedTaskList(request): "
	username = request.user
	Grp = request.user.groups.all()
        groups = request.user.groups.values_list('name',flat=True)  
        print "grp:"
        print groups[0]
        
        
	processInstancesArr = []
	groupTaskDict 	= {}
	groupTaskData	= []
	    
	grp_body_cont 	   = { "unassigned" : "true" , "candidateGroup" : "DataSupportTeam" }
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
        
    	return render_to_response('ds-tasklist.html', {"groupTaskList" : json.dumps(groupTaskData),"group" :groups[0],"user":username})
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting task details.')
        

def KYCTaskList(request):
    try:
        username = request.user
	print "Inside KYCTaskList(request): "
	Grp = request.user.groups.all()
        groups = request.user.groups.values_list('name',flat=True)  
        print "grp:"
        print groups[0]
	processInstancesArr = []
	processInstancesQRArr = []
	groupTaskDict 	= {}
	groupTaskData	= []
	    
	grp_body_cont 	   = { "unassigned" : "true" , "candidateGroup" : "DataSupportTeam" }
	groupTaskList	  = camundaClient._urllib2_request('task?firstResult=0', grp_body_cont, requestType='POST')
	
	for data in groupTaskList:
	    processInstancesArr.append(data["processInstanceId"])
            groupTaskDict[data["processInstanceId"]] = data
	    
	bodyData = { "processInstanceIdIn": processInstancesArr , "variableName" :"kyc"}  
	taskProVarList	 = camundaClient._urllib2_request('variable-instance?deserializeValues=false', bodyData, requestType='POST') 
	
	for data in taskProVarList:
	    if data["value"] == "resolved":
	        processInstancesQRArr.append(data["processInstanceId"])
	
	for data in groupTaskList:
	    if data["processInstanceId"] not in processInstancesQRArr:
            	groupTaskData.append(data)
	
    	return render_to_response('ds-datecount.html', {"groupTaskList" : json.dumps(groupTaskData),"group" :groups[0],"user":username})
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting task details.')


def KYCTasksGroupByDate(request,dateFrom,dateTo):
    print "Inside KYCTasksGroupByDate(request): "
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)  
    print "grp:"
    print groups[0]
    processInstancesQRArr = []
    processInstancesArr = []
    kycTaskDict 	= {}
    kycTaskData	= []
    
    bodyData = {"createdAfter" : dateFrom, "createdBefore"  : dateTo, "unassigned" : "true", "candidateGroup" : "DataSupportTeam"}
    
    kycList		= camundaClient._urllib2_request('task', bodyData, requestType='POST')
    
    for data in kycList:
	processInstancesArr.append(data["processInstanceId"])
        kycTaskDict[data["processInstanceId"]] = data
        
    bodyData = { "processInstanceIdIn": processInstancesArr }  
    taskProVarList	 = camundaClient._urllib2_request('variable-instance?deserializeValues=false', bodyData, requestType='POST') 
	
    for data in taskProVarList:
	if data["processInstanceId"] in kycTaskDict:
	    kycTaskDict[data["processInstanceId"]][data["name"] ] = data["value"]
	if data["value"] == "resolved":
	    processInstancesQRArr.append(data["processInstanceId"])
        	
    #Group Task Assign:	
    for key in kycTaskDict:
    	if key not in processInstancesQRArr:
            kycTaskData.append(kycTaskDict[key])
            
    return HttpResponse(json.dumps(kycTaskData), content_type="application/json")


@login_required
def assignedTaskList(request):
    username = request.user
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)  
    print "grp:"
    print groups[0]
    print "Inside assignedTaskList(request): "
    processInstancesArr = []
    myTaskDict 	= {}
    myTaskData	= []
    myTaskList		= camundaClient._urllib2_request('task?&assignee=kermit', {}, requestType='GET')

    for data in myTaskList:
	processInstancesArr.append(data["processInstanceId"])
        myTaskDict[data["processInstanceId"]] = data
	    
    bodyData = { "processInstanceIdIn": processInstancesArr }  
    taskProVarList	 = camundaClient._urllib2_request('variable-instance?deserializeValues=false', bodyData, requestType='POST')      
	    
    #print "taskProVarList"
    #print taskProVarList
    #Process Variable Instance:
    for data in taskProVarList:
	if data["processInstanceId"] in myTaskDict:
	    myTaskDict[data["processInstanceId"]][data["name"] ] = data["value"]
        	
        	
    #Group Task Assign:	
    for key in myTaskDict:
        if myTaskDict[key].has_key("kyc"):
            myTaskDict[key]["name"] = "Query Response"
        myTaskData.append(myTaskDict[key])
    
    
    return render(request, 'ds-mytask.html',{"myTaskList" :json.dumps(myTaskData), "group" :groups[0],"user":username})

def claim(request, id, name):
    print "name"
    print name
    try:
	#claim	
	if name =="claim":	
	    dataObjClaim = {"userId": "kermit"}
	    url_claim   = django_settings.CAMUNDA_BASE_URL+'task/'+id+'/claim'
        
            r_claim     =  urllib2.Request(url_claim, json.dumps(dataObjClaim) , headers={'Content-Type': 'application/json'})
            claimTask = urllib2.urlopen(r_claim).read()

	    print "claimTask"
	    print claimTask
	    return HttpResponse(json.dumps(claimTask), content_type="application/json" )

	#Unclaim	
	if name =="unclaim":
	    dataObjUnclaim = {"userId": "kermit"}
	    url_Unclaim = django_settings.CAMUNDA_BASE_URL+'task/'+id+'/unclaim'
        
            r_claim = urllib2.Request(url_Unclaim, json.dumps(dataObjUnclaim) ,  headers={'Content-Type': 'application/json'})
            unClaimTask = urllib2.urlopen(r_claim).read()
	    print "unClaimTask"
	    print unClaimTask
	    return HttpResponse(json.dumps(unClaimTask), content_type="application/json" )
        
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred.')
    
    
def tasksCount( request ):
    try:	
        taskCount = {}
        queryCount = 0
        incrementTaskCount = 0 
        mytaskURL = camundaClient._urllib2_request('task', {"assignee" : "kermit"}, requestType='POST')
        urlTask = camundaClient._urllib2_request('task', {"candidateGroup" : "DataSupportTeam"}, requestType='POST')
        for data in mytaskURL:
            if data["name"]:
            	incrementTaskCount += 1
            	taskCount["myTasks"]  = incrementTaskCount 
            else:
                taskCount["myTasks"]  = incrementTaskCount 
        	
        for data in urlTask:
            if data["name"] in taskCount:
            	if data["name"] == "KYC Check":
		    taskCount [data["name"]] = taskCount[data["name"]] + 1
		    grp_body_cont   = { "processVariables": [{"name"  : "kyc","operator" :"eq","value" : "resolved"	}],"unassigned" : "true","candidateGroup" :"DataSupportTeam"}
		    groupTaskList	= camundaClient._urllib2_request('task?firstResult=0', grp_body_cont, requestType='POST')
           	
           	    if groupTaskList:
		    	if groupTaskList[0]:
		     	    taskCount["Query Response"] = len(groupTaskList)
      	     		    queryCount = len(groupTaskList)
      	            	else:
      	            	    taskCount["Query Response"] = 0
      	            else:
      	            	    taskCount["Query Response"] = 0
		else:
		    taskCount [data["name"]] = taskCount[data["name"]] + 1
            else:
                taskCount [data["name"]] = 1  
                
        
        if taskCount.has_key('KYC Check'):
	    taskCount ["KYC Check"]  = taskCount["KYC Check"] - queryCount
	else:
            taskCount ["KYC Check"] = 0
            taskCount["Query Response"] = 0 
        
        taskData = {  'Task' : taskCount   }
        taskData = json.dumps(taskData)	
    
        response = HttpResponse(taskData, content_type='text/plain')
        response['Content-Length'] = len( taskData )
        return response

    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred.')   
        
      
def KYCCheck(request,dateFrom,dateTo):
    username = request.user
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)  
    print "grp:"
    print groups[0]
    return render_to_response( 'ds-tasklist.html', {"dateFrom": dateFrom,"dateTo":dateTo,"group" :groups[0],"user":username})      
    
def queryRespTaskList(request):
    username = request.user
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)  
    print "grp:"
    print groups[0]
    processInstancesArr = []
    QRTaskDict 	= {}
    QRTaskData	= []
	    
    grp_body_cont 	   = { "unassigned" : "true" , "candidateGroup" : "DataSupportTeam",	"processVariables":[{	"name" : "kyc",	"operator" :"eq","value" :"resolved"}] }
    QRTaskList	  = camundaClient._request('task', grp_body_cont, requestType='POST')

    for data in QRTaskList:
        processInstancesArr.append(data["processInstanceId"])
        QRTaskDict[data["processInstanceId"]] = data
    
    bodyData = { "processInstanceIdIn": processInstancesArr }  
    taskProVarList	 = camundaClient._urllib2_request('variable-instance?deserializeValues=false', bodyData, requestType='POST')      
	    
    #Process Variable Instance:
    for data in taskProVarList:
        if data["processInstanceId"] in QRTaskDict:
	    QRTaskDict[data["processInstanceId"]][data["name"] ] = data["value"]
        	
    #Group Task Assign:	
    for key in QRTaskDict:
        print QRTaskDict[key]
    	if  QRTaskDict[key]["name"] == "KYC Check":
    	    QRTaskDict[key]["name"] = "Query Response"
    	QRTaskData.append(QRTaskDict[key])
    print "QRTaskData"
    print QRTaskData
    
    return render_to_response('ds-tasklist.html', {"taskList" :json.dumps(QRTaskData),"group" :groups[0],"user":username})





   
 

