import json

from django.http import HttpResponse
from django.shortcuts import render,render_to_response
from django.views.decorators.csrf  import csrf_exempt
from shgapp.utils.camundaclient import CamundaClient
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *
from shgapp.views.decorator import session_required



helper = Helper()
camundaClient = CamundaClient()


def unassignedTaskList(request):
    try:
        print "Entering unassignedTaskList(request): view"
        username = request.session["userName"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        userId = request.session["userId"]
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

        print "Exiting unassignedTaskList(request): view"
        return render_to_response('ds-tasklist.html', {"groupTaskList" : json.dumps(groupTaskData),"group" :groupName,"user":username,"userId":userId})
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting task details.')

@session_required
def KYCTaskList(request):
    try:
        print "Entering KYCTaskList(request): view "
        username = request.session["userName"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        userId = request.session["userId"]
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
        return render_to_response('ds-datecount.html', {"groupTaskList" : json.dumps(groupTaskData),"group" :groupName,"user":username,"userId":userId})
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting task details.')

@session_required
def KYCTasksGroupByDate(request,dateFrom,dateTo):
    print "Entering KYCTasksGroupByDate(request,dateFrom,dateTo): view "
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    processInstancesQRArr = []
    processInstancesArr = []
    kycTaskDict 	= {}
    kycTaskData	= []
    taskProVarList = []

    bodyData = {"createdAfter" : dateFrom, "createdBefore"  : dateTo, "unassigned" : "true", "candidateGroup" : "DataSupportTeam"}

    kycList		= camundaClient._urllib2_request('task', bodyData, requestType='POST')

    for data in kycList:
        processInstancesArr.append(data["processInstanceId"])
        kycTaskDict[data["processInstanceId"]] = data

    bodyData = { "processInstanceIdIn": processInstancesArr, "variableName" : "groupstatus"}
    groupStatusList = camundaClient._urllib2_request('variable-instance', bodyData, requestType='POST')
    for data in groupStatusList:
        if data["value"] == "false":
            taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=false', {"processInstanceIdIn":[data["processInstanceId"]]},
                                                            requestType='POST')
            taskProVarList.append(taskProVarList1)
        else:
            taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=true',  {"processInstanceIdIn":[data["processInstanceId"]]},
                                                            requestType='POST')
            taskProVarList.append(taskProVarList1)

    for key in range(len(taskProVarList)):
        for data in taskProVarList[key]:
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

@session_required
def assignedTaskList(request):
    print "Entering assignedTaskList(request): view"
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    processInstancesArr = []
    taskProVarList =[]
    myTaskDict 	= {}
    myTaskData	= []
    user = "%20".join(username.split(" "))
    myTaskList		= camundaClient._urllib2_request('task?&assignee='+str(user), {}, requestType='GET')

    for data in myTaskList:
        if groupName == "CMR" or groupName == "CLM" or groupName == "BM":
            processInstancesArr.append(data["processInstanceId"])
            dictKey = data["processInstanceId"]+"_"+data["id"]
            myTaskDict[dictKey] = data

        else:
            processInstancesArr.append(data["processInstanceId"])
            myTaskDict[data["processInstanceId"]] = data

    bodyData = { "processInstanceIdIn": processInstancesArr, "variableName" :"groupstatus" }
    print "bodyData"
    print json.dumps(bodyData)
    groupStatusList = camundaClient._urllib2_request('variable-instance', bodyData, requestType='POST')
    print "groupStatusList"
    print groupStatusList
    for data in groupStatusList:
        if data["value"] == "false":
            taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=false',
                                                             {"processInstanceIdIn": [data["processInstanceId"]]},
                                                             requestType='POST')
            taskProVarList.append(taskProVarList1)
        else:
            taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=true',
                                                             {"processInstanceIdIn": [data["processInstanceId"]]},
                                                             requestType='POST')
            taskProVarList.append(taskProVarList1)
    #Process Variable Instance:
    for key in range(len(taskProVarList)):
        for data in taskProVarList[key]:
            if groupName == "CMR" or groupName == "CLM" or groupName == "BM":
                for key1 in myTaskDict:
                    if key1.find(data["processInstanceId"]) != -1:
                        myTaskDict[key1][data["name"] ] = data["value"]
            else:
                if data["processInstanceId"] in myTaskDict:
                    myTaskDict[data["processInstanceId"]][data["name"] ] = data["value"]

    print "myTaskDict"
    print myTaskDict
    #Group Task Assign:	
    for key in myTaskDict:
        if groupName == "DataSupportTeam":
            if myTaskDict[key].has_key("kyc"):
            	if myTaskDict[key]["kyc"] == "resolved":
	                myTaskDict[key]["name"] = "Query Response"
            myTaskData.append(myTaskDict[key])
        if groupName == "CMR" or groupName == "CLM" or groupName == "BM":
            myTaskData.append(myTaskDict[key])
        if groupName == "RM" or groupName == "rm":
            myTaskData.append(myTaskDict[key])
        if groupName == "CreditTeam":
            myTaskData.append(myTaskDict[key])
    print "myTaskData"
    print myTaskData
    print "Exiting assignedTaskList(request): view"
    return render(request, 'ds-mytask.html',{"myTaskList" :json.dumps(myTaskData), "group" :groupName, "user":username,"userId":userId})

def claim(request, id, name):
    print "Entering claim(request, id, name): view"
    username = request.session["userName"]
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

@session_required
def tasksCount( request):
    print "Entering tasksCount( request ): view"
    try:
        username = request.session["userName"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        officeId = userOfficeData["officeId"]
        taskCount = {}
        queryCount = 0
        BMReplyCount =0
        bodyLocationData = {}
        incrementTaskCount = 0
        if groupName == "RM":
            bodyLocationData = {"candidateGroup": str(groupName),
                                "processVariables": [{"name": "regionId", "operator": "eq", "value": officeId}]}
        if groupName == "CLM" or groupName == "BM" or groupName == "CMR":
            bodyLocationData = {"candidateGroup": "CLM",
                                "processVariables": [{"name": "clusterId", "operator": "eq", "value": officeId}]}
        if groupName == "DataSupportTeam" or groupName == "CreditTeam":
            bodyLocationData = {"candidateGroup": str(groupName)}
        mytaskURL = camundaClient._urllib2_request('task', {"assignee" : str(username)}, requestType='POST')
        urlTask = camundaClient._urllib2_request('task', bodyLocationData, requestType='POST')
        print "urlTask:"
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
                    taskCount[data["name"]] = 1
                    grp_body_cont = {"processVariables": [{"name": "kyc", "operator": "eq", "value": "resolved"}],
                                     "unassigned": "true", "candidateGroup": "DataSupportTeam"}
                    groupTaskList = camundaClient._urllib2_request('task?firstResult=0', grp_body_cont,
                                                                   requestType='POST')
                    if groupTaskList:
                        if groupTaskList[0]:
                            taskCount["Query Response"] = len(groupTaskList)
                            queryCount = len(groupTaskList)
                        else:
                            taskCount["Query Response"] = 0
                    else:
                        taskCount["Query Response"] = 0
            if taskCount.has_key('KYC Check'):
                taskCount ["KYC Check"]  = taskCount["KYC Check"] - queryCount
            else:
                taskCount ["KYC Check"] = 0
                taskCount["Query Response"] = 0

        if groupName == "CMR" or groupName == "CLM"  or groupName == "BM" or groupName == "RM" or groupName == "rm":
            for data in urlTask:
                if data["name"] in taskCount:
                    taskCount [data["name"]] = taskCount[data["name"]] + 1
                else:
                    taskCount [data["name"]] = 1

        if groupName == "CreditTeam":
            for data in urlTask:
                if data["name"] in taskCount:
                    if data["name"] == "Proposal scrutiny":
                        taskCount [data["name"]] = taskCount[data["name"]] + 1
                        grp_body_cont   = { "processVariables": [{"name"  : "chekcbrespdate","operator" :"eq","value" : "resolved"	}],"unassigned" : "true","candidateGroup" :"CreditTeam"}
                        groupTaskList	= camundaClient._urllib2_request('task?firstResult=0', grp_body_cont, requestType='POST')
                        if groupTaskList:
                            if groupTaskList[0]:
                                taskCount["BM Reply"] = len(groupTaskList)
                                BMReplyCount = len(groupTaskList)
                            else:
                                taskCount["BM Reply"] = 0
                        else:
                            taskCount["BM Reply"] = 0
                    else:
                        taskCount [data["name"]] = taskCount[data["name"]] + 1
                else:
                    if data["name"] != "Proposal scrutiny":
                        taskCount [data["name"]] = 1
                    else:
                        taskCount[data["name"]] =  1
                        grp_body_cont = {
                            "processVariables": [{"name": "chekcbrespdate", "operator": "eq", "value": "resolved"}],
                            "unassigned": "true", "candidateGroup": "CreditTeam"}
                        groupTaskList = camundaClient._urllib2_request('task?firstResult=0', grp_body_cont,
                                                                       requestType='POST')
                        if groupTaskList:
                            if groupTaskList[0]:
                                taskCount["BM Reply"] = len(groupTaskList)
                                BMReplyCount = len(groupTaskList)
                            else:
                                taskCount["BM Reply"] = 0
                        else:
                            taskCount["BM Reply"] = 0
            if taskCount.has_key('Proposal scrutiny'):
                taskCount ["Proposal scrutiny"]  = taskCount["Proposal scrutiny"] - BMReplyCount
            else:
                taskCount ["Proposal scrutiny"] = 0
                taskCount["BM Reply"] = 0

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

@session_required
def KYCCheck(request,dateFrom,dateTo):
    print "Entering KYCCheck(request,dateFrom,dateTo): view"
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    print "Exiting KYCCheck(request,dateFrom,dateTo): view"
    return render_to_response( 'ds-tasklist.html', {"dateFrom": dateFrom,"userId":userId,"dateTo":dateTo,"group" :groupName,"user":username,"taskName":"KYC Check"})

@session_required
def queryRespTaskList(request):
    print "Entering queryRespTaskList(request): view"
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    taskName = ''
    taskProVarList = []
    processInstancesArr = []
    QRTaskDict 	= {}
    QRTaskData	= []
    grp_body_cont ={}
    if groupName == "DataSupportTeam":
        grp_body_cont 	   = { "unassigned" : "true" , "candidateGroup" : "DataSupportTeam",	"processVariables":[{	"name" : "kyc",	"operator" :"eq","value" :"resolved"}] }
        taskName = "Query Response"
    if groupName == "CreditTeam":
        grp_body_cont = {"unassigned": "true", "candidateGroup": "CreditTeam",
                         "processVariables": [{"name": "chekcbrespdate", "operator": "eq", "value": "resolved"}]}
        taskName = "BM Reply"
    QRTaskList	  = camundaClient._request('task', grp_body_cont, requestType='POST')

    for data in QRTaskList:
        processInstancesArr.append(data["processInstanceId"])
        QRTaskDict[data["processInstanceId"]] = data

    bodyData = {"processInstanceIdIn": processInstancesArr, "variableName": "groupstatus"}
    groupStatusList = camundaClient._urllib2_request('variable-instance', bodyData, requestType='POST')
    for data in groupStatusList:
        if data["value"] == "false":
            taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=false',
                                                             {"processInstanceIdIn": [data["processInstanceId"]]},
                                                             requestType='POST')
            taskProVarList.append(taskProVarList1)
        else:
            taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=true',
                                                             {"processInstanceIdIn": [data["processInstanceId"]]},
                                                             requestType='POST')
            taskProVarList.append(taskProVarList1)

    # Process Variable Instance:
    for key in range(len(taskProVarList)):
        for data in taskProVarList[key]:
            if data["processInstanceId"] in QRTaskDict:
                QRTaskDict[data["processInstanceId"]][data["name"] ] = data["value"]

    #Group Task Assign:	
    for key in QRTaskDict:
        if groupName == "DataSupportTeam":
            if  QRTaskDict[key]["name"] == "KYC Check":
                QRTaskDict[key]["name"] = "Query Response"
            QRTaskData.append(QRTaskDict[key])

        if groupName == "CreditTeam":
            if  QRTaskDict[key]["name"] == "Proposal scrutiny":
                QRTaskDict[key]["name"] = "BM Reply"
            QRTaskData.append(QRTaskDict[key])

    return render_to_response('ds-tasklist.html', {"userId":userId,"taskList" :json.dumps(QRTaskData),"group" :groupName,"user":username,"taskName":taskName})

@csrf_exempt
@session_required
def updateTask(request):
    try:
        print "Entering updateTask(request) : "
        if request.method == "POST":
            formData = json.loads(request.body)
            if formData.has_key("processUpdate"):
                bodyData = formData["processUpdate"]
            else:
                bodyData = {}
            taskId = formData["taskId"]
            taskUpdateResponse =  camundaClient._urllib2_request('task/'+taskId+'/complete',bodyData,requestType='POST')
            return HttpResponse(json.dumps(taskUpdateResponse), content_type='text/plain')
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred.')

@session_required
def taskComplete(request,processUpdate,taskId):
    try:
        print "Entering taskComplete(processUpdate,taskId) : "
        if processUpdate:
            bodyData = processUpdate
            print type(bodyData)
        else:
            bodyData = {}
        taskId 	= taskId
        print "bodyData"
        print bodyData
        taskUpdateResponse =  camundaClient._urllib2_request('task/'+taskId+'/complete',bodyData,requestType='POST')
        print "taskUpdateResponse in taskcomplete"
        print taskUpdateResponse
        return taskUpdateResponse
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred.')

@session_required
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

@session_required
def proposalScrutinyTaskList(request):
    print "Entering proposalScrutinyTaskList(request): view "
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    processInstancesQRArr = []
    processInstancesArr = []
    proposalScrutinyDict 	= {}
    proposalScrutinyData	= []
    taskProVarList = []

    bodyData = { "unassigned" : "true", "candidateGroup" : "CreditTeam", "name" : "Proposal scrutiny"}

    proposalScrutinyList		= camundaClient._urllib2_request('task', bodyData, requestType='POST')

    for data in proposalScrutinyList:
        processInstancesArr.append(data["processInstanceId"])
        proposalScrutinyDict[data["processInstanceId"]] = data

    bodyData = { "processInstanceIdIn": processInstancesArr, "variableName" : "groupstatus"}
    groupStatusList = camundaClient._urllib2_request('variable-instance', bodyData, requestType='POST')

    for data in groupStatusList:
        if data["value"] == "false":
            taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=false', {"processInstanceIdIn":[data["processInstanceId"]]},
                                                            requestType='POST')
            taskProVarList.append(taskProVarList1)
        else:
            taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=true',  {"processInstanceIdIn":[data["processInstanceId"]]},
                                                            requestType='POST')
            taskProVarList.append(taskProVarList1)

    for key in range(len(taskProVarList)):
        for data in taskProVarList[key]:
            print data
            if data["processInstanceId"] in proposalScrutinyDict:
                proposalScrutinyDict[data["processInstanceId"]][data["name"] ] = data["value"]
            if data["name"] == "chekcbrespdate":
                if data["value"] == "resolved":
                    processInstancesQRArr.append(data["processInstanceId"])


    #Group Task Assign:
    for key in proposalScrutinyDict:
        if key not in processInstancesQRArr:
            proposalScrutinyData.append(proposalScrutinyDict[key])

    print "Exiting proposalScrutiny(request): view "
    return render_to_response('ds-tasklist.html', {"userId":userId,"taskList" : json.dumps(proposalScrutinyData),"taskName": "Proposal scrutiny","group" :groupName,"user":username})
