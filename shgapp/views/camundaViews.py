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


def unassignedTaskList(request):
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

        print "Exiting unassignedTaskList(request): view"
        return render_to_response('ds-tasklist.html', {"groupTaskList" : json.dumps(groupTaskData),"group" :groups[0],"user":username})
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting task details.')


def KYCTaskList(request):
    try:
        print "Entering KYCTaskList(request): view "
        username = request.user
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

        print "Exiting KYCTaskList(request): view "
        return render_to_response('ds-datecount.html', {"groupTaskList" : json.dumps(groupTaskData),"group" :groups[0],"user":username})
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting task details.')


def KYCTasksGroupByDate(request,dateFrom,dateTo):
    print "Entering KYCTasksGroupByDate(request,dateFrom,dateTo): view "
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

    print "Exiting KYCTasksGroupByDate(request,dateFrom,dateTo): view "
    return HttpResponse(json.dumps(kycTaskData), content_type="application/json")


@login_required
def assignedTaskList(request):
    print "Entering assignedTaskList(request): view"
    username = request.user
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)
    print "grp:"
    print groups[0]
    groupName = groups[0]
    processInstancesArr = []
    myTaskDict 	= {}
    myTaskData	= []
    myTaskList		= camundaClient._urllib2_request('task?&assignee='+str(username), {}, requestType='GET')

    for data in myTaskList:
        if groupName == "CLM_BM":
            processInstancesArr.append(data["processInstanceId"])
            dictKey = data["processInstanceId"]+"_"+data["id"]
            myTaskDict[dictKey] = data

        else:
            processInstancesArr.append(data["processInstanceId"])
            myTaskDict[data["processInstanceId"]] = data


    bodyData = { "processInstanceIdIn": processInstancesArr }
    taskProVarList	 = camundaClient._urllib2_request('variable-instance?deserializeValues=false', bodyData, requestType='POST')
    #Process Variable Instance:
    for data in taskProVarList:
        if groupName == "CLM_BM":
            for key in myTaskDict:
                if key.find(data["processInstanceId"]) != -1:
                    myTaskDict[key][data["name"] ] = data["value"]
        else:
            if data["processInstanceId"] in myTaskDict:
                myTaskDict[data["processInstanceId"]][data["name"] ] = data["value"]

    #Group Task Assign:	
    for key in myTaskDict:
        if groupName == "DataSupportTeam":
            if myTaskDict[key].has_key("kyc"):
                myTaskDict[key]["name"] = "Query Response"
            myTaskData.append(myTaskDict[key])
        if groupName == "CLM_BM":
            myTaskData.append(myTaskDict[key])

    print "Exiting assignedTaskList(request): view"
    return render(request, 'ds-mytask.html',{"myTaskList" :json.dumps(myTaskData), "group" :groups[0],"user":username})

def claim(request, id, name):
    print "Entering claim(request, id, name): view"
    dataObjClaim = {}
    username = request.user
    try:
        #claim
        if name =="claim":
            print name
            dataObjClaim = {"userId": str(username)}
            claimTask = camundaClient._urllib2_request('task/'+id+'/claim',dataObjClaim,requestType='POST')
            print "Exiting claim(request, id, name): view"
            return HttpResponse(json.dumps(claimTask), content_type="application/json" )

        #Unclaim
        if name =="unclaim":
            print name
            dataObjClaim = {"userId": str(username)}
            unClaimTask = camundaClient._urllib2_request('task/'+id+'/unclaim',dataObjClaim,requestType='POST')
            print "Exiting claim(request, id, name): view"
            return HttpResponse(json.dumps(unClaimTask), content_type="application/json" )

    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred.')


def tasksCount( request ):
    print "Entering tasksCount( request ): view"
    try:
        username = request.user
        Grp = request.user.groups.all()
        groups = request.user.groups.values_list('name',flat=True)
        groupName = groups[0]
        taskCount = {}
        queryCount = 0
        incrementTaskCount = 0
        mytaskURL = camundaClient._urllib2_request('task', {"assignee" : str(username)}, requestType='POST')
        urlTask = camundaClient._urllib2_request('task', {"candidateGroup" : str(groupName)}, requestType='POST')
        print "urlTask"
        print urlTask
        for data in mytaskURL:
            if data["name"]:
                incrementTaskCount += 1
                taskCount["myTasks"]  = incrementTaskCount
            else:
                taskCount["myTasks"]  = incrementTaskCount

        if groupName == "DataSupportTeam":
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

        if groupName == "CLM_BM":
            for data in urlTask:
                if data["name"] in taskCount:
                    taskCount [data["name"]] = taskCount[data["name"]] + 1
                else:
                    taskCount [data["name"]] = 1

        taskData = {  'Task' : taskCount   }
        taskData = json.dumps(taskData)
        print "taskData"
        print taskData

        response = HttpResponse(taskData, content_type='text/plain')
        response['Content-Length'] = len( taskData )
        print "Exiting tasksCount( request ): view"
        return response

    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred.')


def KYCCheck(request,dateFrom,dateTo):
    print "Entering KYCCheck(request,dateFrom,dateTo): view"
    username = request.user
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)
    print "grp:"
    print groups[0]
    print "Exiting KYCCheck(request,dateFrom,dateTo): view"
    return render_to_response( 'ds-tasklist.html', {"dateFrom": dateFrom,"dateTo":dateTo,"group" :groups[0],"user":username})

def queryRespTaskList(request):
    print "Entering queryRespTaskList(request): view"
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


@csrf_exempt
def updateTask(request):
    try:
        print "Entering updateTask(request) : "
        if request.method == "POST":
            print request.body
            formData = json.loads(request.body)
            if formData["processUpdate"]:
                bodyData = formData["processUpdate"]
            else:
                bodyData = {}
            taskId = formData["taskId"]
            print "bodyData"
            print bodyData
            taskUpdateResponse =  camundaClient._urllib2_request('task/'+taskId+'/complete',bodyData,requestType='POST')
            print "taskUpdateResponse"
            print taskUpdateResponse
            return HttpResponse(json.dumps(taskUpdateResponse), content_type='text/plain')
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred.')


def taskComplete(processUpdate,taskId):
    try:
        print "Entering taskComplete(processUpdate,taskId) : "
        if processUpdate:
            bodyData = json.dumps(processUpdate)
        else:
            bodyData = {}
        taskId 	= taskId
        taskUpdateResponse =  camundaClient._urllib2_request('task/'+taskId+'/complete',bodyData,requestType='POST')
        return taskUpdateResponse
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred.')


def getHistoryComments(request,processId):
    try:
        histCommentsDict = {}
        print "Entering getHistoryComments(request,processId):"
        historyData =  camundaClient._urllib2_request('history/activity-instance?processInstanceId='+str(processId),{},requestType='GET')
        if historyData[0]:
            for data in range(len(historyData)):
                if historyData[data]["activityType"] == "serviceTask" or historyData[data]["activityType"] == "userTask":
                    histCommentsDict[historyData[data]["id"]] =  historyData[data]
                    if historyData[data]["taskId"]:
                        commentsData =  camundaClient._urllib2_request('task/'+str(historyData[data]["taskId"])+'/comment',{},requestType='GET')
                        histCommentsDict[historyData[data]["id"]]["comments"] = commentsData
            return HttpResponse(json.dumps(histCommentsDict), content_type='text/plain')
        else:
            return HttpResponse(json.dumps({"Message":"No data"}), content_type='text/plain')
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred.')  


