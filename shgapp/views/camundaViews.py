
import json
from django.http import HttpResponse
from django.shortcuts import render, render_to_response
from django.views.decorators.csrf import csrf_exempt
from shgapp.utils.camundaclient import CamundaClient
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *
from shgapp.views.decorator import session_required, decryption_required

helper = Helper()
camundaClient = CamundaClient()

import logging
import sys
logging.basicConfig(level=logging.INFO)
loggerInfo = logging.getLogger(__name__)

logging.basicConfig(level=logging.ERROR)
errorLog = logging.getLogger(__name__)


def unassignedTaskList(request):
    try:
        loggerInfo.info('------------------Entering unassignedTaskList(request):---------------------- ')
        username = request.session["userName"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        userId = request.session["userId"]

        processInstancesArr = []
        groupTaskDict = {}
        groupTaskData = []

        grp_body_cont = {"unassigned": "true", "candidateGroup": "DataSupportTeam"}
        groupTaskList = camundaClient._urllib2_request('task?firstResult=0', grp_body_cont, requestType='POST')

        for data in groupTaskList:
            processInstancesArr.append(data["processInstanceId"])
            groupTaskDict[data["processInstanceId"]] = data

        bodyData = {"processInstanceIdIn": processInstancesArr}
        taskProVarList = camundaClient._urllib2_request('variable-instance?deserializeValues=false', bodyData,
                                                        requestType='POST')

        for data in taskProVarList:
            if data["processInstanceId"] in groupTaskDict:
                groupTaskDict[data["processInstanceId"]][data["name"]] = data["value"]

        for key in groupTaskDict:
            groupTaskData.append(groupTaskDict[key])

        loggerInfo.info('------------------Exiting unassignedTaskList(request):---------------------- ')
        return render_to_response('ds-tasklist.html',
                                  {"groupTaskList": json.dumps(groupTaskData), "group": groupName, "user": username,
                                   "userId": userId})
    except ShgInvalidRequest, e:
        errorLog.error('unassignedTaskList Exception e:  %s' % e)
        return helper.bad_request('Unexpected error occurred while getting task details.')


@session_required
def KYCTaskList(request):
    try:
        loggerInfo.info('------------------"Entering KYCTaskList(request):---------------------- ')
        username = request.session["userName"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        userId = request.session["userId"]
        processInstancesArr = []
        processInstancesQRArr = []
        groupTaskDict = {}
        groupTaskData = []

        grp_body_cont = {"unassigned": "true", "candidateGroup": "DataSupportTeam"}
        groupTaskList = camundaClient._urllib2_request('task?firstResult=0', grp_body_cont, requestType='POST')

        for data in groupTaskList:
            loggerInfo.info('data...', data)
            processInstancesArr.append(data["processInstanceId"])
            groupTaskDict[data["processInstanceId"]] = data

        bodyData = {"processInstanceIdIn": processInstancesArr, "variableName": "kyc"}
        taskProVarList = camundaClient._urllib2_request('variable-instance?deserializeValues=false', bodyData,
                                                        requestType='POST')

        for data in taskProVarList:
            if data["value"] == "resolved":
                processInstancesQRArr.append(data["processInstanceId"])

        for data in groupTaskList:
            if data["processInstanceId"] not in processInstancesQRArr:
                groupTaskData.append(data)

        loggerInfo.info('------------------Exiting KYCTaskList(request):---------------------- ')
        return render_to_response('ds-datecount.html',
                                  {"groupTaskList": json.dumps(groupTaskData), "group": groupName, "user": username,
                                   "userId": userId})
    except ShgInvalidRequest, e:
        errorLog.error('KYCTaskList Exception e:  %s' % e)
        return helper.bad_request('Unexpected error occurred while getting task details.')


# @decryption_required
@session_required
def KYCTasksGroupByDate(request, dateFrom, dateTo):
    loggerInfo.info('------------------Entering KYCTasksGroupByDate(request,dateFrom,dateTo)---------------------- ')
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    processInstancesQRArr = []
    processInstancesArr = []
    kycTaskDict = {}
    kycTaskData = []
    taskProVarList = []

    bodyData = {"createdAfter": dateFrom,
                "createdBefore": dateTo,
                "unassigned": "true",
                "candidateGroup": "DataSupportTeam"}

    kycList = camundaClient._urllib2_request('task', bodyData, requestType='POST')

    for data in kycList:
        processInstancesArr.append(data["processInstanceId"])
        kycTaskDict[data["processInstanceId"]] = data

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

    for key in range(len(taskProVarList)):
        for data in taskProVarList[key]:
            if data["processInstanceId"] in kycTaskDict:
                kycTaskDict[data["processInstanceId"]][data["name"]] = data["value"]
            if data["value"] == "resolved":
                processInstancesQRArr.append(data["processInstanceId"])

    for key in kycTaskDict:
        if key not in processInstancesQRArr:
            kycTaskData.append(kycTaskDict[key])
    loggerInfo.info('------------------Exiting KYCTasksGroupByDate(request,dateFrom,dateTo)---------------------- ')
    return HttpResponse(json.dumps(kycTaskData), content_type="application/json")


@session_required
def assignedTaskList(request):
    loggerInfo.info('------------------Entering assignedTaskList(request)---------------------- ')
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    loginUser = request.session["userLogin"]
    userId = request.session["userId"]
    userAction = request.session["userActions"]
    processInstancesArr = []
    taskProVarList = []
    myTaskDict = {}
    myTaskData = []
    proInstArrFalse = []
    proInstArrTrue = []
    user = "%20".join(username.split(" "))
    myTaskList = camundaClient._urllib2_request('task?&assignee=' + str(loginUser), {}, requestType='GET')
    for data in myTaskList:
        if groupName == "CMR" or groupName == "CLM" or groupName == "BM":
            processInstancesArr.append(data["processInstanceId"])
            dictKey = data["processInstanceId"] + "_" + data["id"]
            myTaskDict[dictKey] = data

        else:
            processInstancesArr.append(data["processInstanceId"])
            myTaskDict[data["processInstanceId"]] = data
    bodyData = {"processInstanceIdIn": processInstancesArr, "variableName": "groupstatus"}
    groupStatusList = camundaClient._urllib2_request('variable-instance', bodyData, requestType='POST')
    for data in groupStatusList:
        if data["value"] == "false":
            proInstArrFalse.append(data["processInstanceId"])

        else:
            proInstArrTrue.append(data["processInstanceId"])
    if proInstArrFalse:
        if proInstArrFalse[0]:
            taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=false'
                                                             ,{"processInstanceIdIn": proInstArrFalse}, requestType='POST')
            taskProVarList.append(taskProVarList1)
    if proInstArrTrue:
        if proInstArrTrue[0]:
            taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=true'
                                                             ,{"processInstanceIdIn": proInstArrTrue}, requestType='POST')
            taskProVarList.append(taskProVarList1)
    for key in range(len(taskProVarList)):
        for data in taskProVarList[key]:
            if groupName == "CMR" or groupName == "CLM" or groupName == "BM":
                for key1 in myTaskDict:
                    if key1.find(data["processInstanceId"]) != -1:
                        myTaskDict[key1][data["name"]] = data["value"]
            else:
                if data["processInstanceId"] in myTaskDict:
                    myTaskDict[data["processInstanceId"]][data["name"]] = data["value"]
    for key in myTaskDict:
        if groupName == "DataSupportTeam":
            if myTaskDict[key].has_key("kyc"):
                if myTaskDict[key]["kyc"] == "resolved":
                    myTaskDict[key]["name"] = "Query Response"
            myTaskData.append(myTaskDict[key])
        if groupName == "CMR" or groupName == "CLM" or groupName == "BM" or groupName == "RM" or groupName == "rm" or groupName == "CreditTeam":
            myTaskData.append(myTaskDict[key])
    loggerInfo.info( "myTaskData")
    loggerInfo.info( myTaskData)
    loggerInfo.info('------------------Exiting assignedTaskList(request)---------------------- ')
    if 'Loan-Edit' in userAction:
        return render(request, 'ds-mytask.html',
                  {"myTaskList": json.dumps(myTaskData), "group": groupName, "user": username, "userId": userId, "roleAction" : 'Loan-Edit'})
    else:
        return render(request, 'ds-mytask.html',
                      {"myTaskList": json.dumps(myTaskData), "group": groupName, "user": username, "userId": userId})


# @decryption_required
def claim(request, id, name):
    loggerInfo.info('------------------Entering claim(request, id, name)---------------------- ')
    username = request.session["userLogin"]
    try:
        if name == "claim":
            loggerInfo.info('name')
            loggerInfo.info(name)
            dataObjClaim = {"userId": str(username)}
            claimTask = camundaClient._urllib2_request('task/' + id + '/claim', dataObjClaim, requestType='POST')
            loggerInfo.info('------------------Exiting claim(request, id, name)---------------------- ')
            return HttpResponse(json.dumps(claimTask), content_type="application/json")

        if name == "unclaim":
            loggerInfo.info('name')
            loggerInfo.info(name)
            dataObjClaim = {"userId": str(username)}
            unClaimTask = camundaClient._urllib2_request('task/' + id + '/unclaim', dataObjClaim, requestType='POST')
            loggerInfo.info('------------------Exiting claim(request, id, name)---------------------- ')
            return HttpResponse(json.dumps(unClaimTask), content_type="application/json")

    except ShgInvalidRequest, e:
        errorLog.error('Exception raised inside claim(request, id, name): %s' % e)
        return helper.bad_request('Unexpected error occurred.')


# @decryption_required
@session_required
def taskListLoanType(request, taskName):
    loggerInfo.info('------------------Entering taskListLoanType(request)---------------------- ')
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userAction = request.session["userActions"]
    userId = request.session["userId"]
    loggerInfo.info('------------------Exiting taskListLoanType(request)---------------------- ')
    if 'Loan-Edit' in userAction:
        return render_to_response('ds-tasklist.html',
                              {"userId": userId, "group": groupName, "user": username, "taskName": taskName,'roleAction': 'Loan-Edit'})
    else:
        return render_to_response('ds-tasklist.html',
                                  {"userId": userId, "group": groupName, "user": username, "taskName": taskName})


# @decryption_required
@session_required
def KYCCheck(request, dateFrom, dateTo):
    loggerInfo.info('------------------Entering KYCCheck(request,dateFrom,dateTo)---------------------- ')
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    loggerInfo.info('------------------Exiting KYCCheck(request,dateFrom,dateTo)---------------------- ')
    return render_to_response('ds-tasklist.html',
                              {"dateFrom": dateFrom, "userId": userId, "dateTo": dateTo, "group": groupName,
                               "user": username, "taskName": "KYC Check"})


# @decryption_required
@session_required
def confirmDisburseRwrk(request):
    loggerInfo.info('------------------Entering confirmDisburseRwrk(request)---------------------- ')
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    taskProVarList = []
    processInstancesArr = []
    QRTaskDict = {}
    QRTaskData = []
    proInstArrFalse = []
    proInstArrTrue = []

    grp_body_cont = {}
    if groupName == "CLM" or groupName == "BM" or groupName == "CMR":
        grp_body_cont = {"unassigned": "true", "candidateGroup": "CLM",
                         "processVariables": [{"name": "disbursement", "operator": "eq", "value": "rework"}]}
    QRTaskList = camundaClient._request('task', grp_body_cont, requestType='POST')

    loggerInfo.info('----"QRTaskList------ ')
    loggerInfo.info(QRTaskList)

    for data in QRTaskList:
        processInstancesArr.append(data["processInstanceId"])
        QRTaskDict[data["processInstanceId"]] = data

    bodyData = {"processInstanceIdIn": processInstancesArr, "variableName": "groupstatus"}
    groupStatusList = camundaClient._urllib2_request('variable-instance', bodyData, requestType='POST')
    for data in groupStatusList:
        if data["value"] == "false":
            proInstArrFalse.append(data["processInstanceId"])
        else:
            proInstArrTrue.append(data["processInstanceId"])

    if proInstArrFalse:
        if proInstArrFalse[0]:
            taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=false'
                                                             ,{"processInstanceIdIn": proInstArrFalse}, requestType='POST')
            taskProVarList.append(taskProVarList1)
    if proInstArrTrue:
        if proInstArrTrue[0]:
            taskProVarList2 = camundaClient._urllib2_request('variable-instance?deserializeValues=true'
                                                             ,{"processInstanceIdIn": proInstArrTrue}, requestType='POST')
            taskProVarList.append(taskProVarList2)

    for key in range(len(taskProVarList)):
        for data in taskProVarList[key]:
            if data["processInstanceId"] in QRTaskDict:
                QRTaskDict[data["processInstanceId"]][data["name"]] = data["value"]

    
    taskProVarList4 = camundaClient._urllib2_request('history/process-instance',{"processInstanceIds": proInstArrTrue}, requestType='POST')
    
    for data in taskProVarList4:
        if data["id"] in QRTaskDict:
            QRTaskDict[data["id"]]["processStartTime"] = data["startTime"]


    for key in QRTaskDict:
        if groupName == "CLM" or groupName == "BM" or groupName == "CMR":
            if QRTaskDict[key]["name"] == "Upload disbursement docs":
                QRTaskDict[key]["name"] = "Resolve Confirm Disbursement Query"
            QRTaskData.append(QRTaskDict[key])
    loggerInfo.info('------------------Exiting confirmDisburseRwrk(request)---------------------- ')
    return HttpResponse(json.dumps(QRTaskData), content_type="application/json")


# @decryption_required
@session_required
def queryRespTaskList(request):
    loggerInfo.info('------------------Entering queryRespTaskList(request)---------------------- ')
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    taskProVarList = []
    processInstancesArr = []
    QRTaskDict = {}
    QRTaskData = []
    proInstArrFalse = []
    proInstArrTrue = []

    grp_body_cont = {}
    if groupName == "DataSupportTeam":
        grp_body_cont = {"unassigned": "true",
                         "candidateGroup": "DataSupportTeam",
                         "processVariables": [{"name": "kyc", "operator": "eq", "value": "resolved"}]}
    if groupName == "CreditTeam":
        grp_body_cont = {"unassigned": "true", "candidateGroup": "CreditTeam",
                         "processVariables": [{"name": "chekcbrespdate", "operator": "eq", "value": "resolved"}]}
    QRTaskList = camundaClient._request('task', grp_body_cont, requestType='POST')

    loggerInfo.info('------"QRTaskList-------- ')
    loggerInfo.info(QRTaskList)

    for data in QRTaskList:
        processInstancesArr.append(data["processInstanceId"])
        QRTaskDict[data["processInstanceId"]] = data

    bodyData = {"processInstanceIdIn": processInstancesArr, "variableName": "groupstatus"}
    groupStatusList = camundaClient._urllib2_request('variable-instance', bodyData, requestType='POST')
    for data in groupStatusList:
        if data["value"] == "false":
            proInstArrFalse.append(data["processInstanceId"])
        else:
            proInstArrTrue.append(data["processInstanceId"])

    if proInstArrFalse:
        if proInstArrFalse[0]:
            taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=false'
                                                             ,{"processInstanceIdIn": proInstArrFalse}, requestType='POST')
            taskProVarList.append(taskProVarList1)
    if proInstArrTrue:
        if proInstArrTrue[0]:
            taskProVarList2 = camundaClient._urllib2_request('variable-instance?deserializeValues=true'
                                                             ,{"processInstanceIdIn": proInstArrTrue}, requestType='POST')
            taskProVarList.append(taskProVarList2)

    for key in range(len(taskProVarList)):
        for data in taskProVarList[key]:
            if data["processInstanceId"] in QRTaskDict:
                QRTaskDict[data["processInstanceId"]][data["name"]] = data["value"]

    taskProVarList4 = camundaClient._urllib2_request('history/process-instance',{"processInstanceIds": proInstArrTrue}, requestType='POST')
    
    for data in taskProVarList4:
        if data["id"] in QRTaskDict:
            QRTaskDict[data["id"]]["processStartTime"] = data["startTime"]



    for key in QRTaskDict:
        if groupName == "DataSupportTeam":
            if QRTaskDict[key]["name"] == "KYC Check":
                QRTaskDict[key]["name"] = "Query Response"
            QRTaskData.append(QRTaskDict[key])

        if groupName == "CreditTeam":
            if QRTaskDict[key]["name"] == "Proposal scrutiny":
                QRTaskDict[key]["name"] = "BM Reply"
            QRTaskData.append(QRTaskDict[key])
    loggerInfo.info('------------------Exiting queryRespTaskList(request)---------------------- ')
    return HttpResponse(json.dumps(QRTaskData), content_type="application/json")


@csrf_exempt
@session_required
def updateTask(request):
    loggerInfo.info('------------------Entering updateTask(request)---------------------- ')
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            if formData.has_key("processUpdate"):
                bodyData = formData["processUpdate"]
            else:
                bodyData = {}
            taskId = formData["taskId"]

            taskUpdateResponse = camundaClient._urllib2_request('task/' + taskId + '/complete', bodyData,
                                                                requestType='POST')
            loggerInfo.info('------------------Exiting updateTask(request)---------------------- ')
            return HttpResponse(json.dumps(taskUpdateResponse), content_type='text/plain')
    except ShgInvalidRequest, e:
        errorLog.error('Exception raised inside updateTask(request):  %s' % e)
        return helper.bad_request('Unexpected error occurred.')


@session_required
def taskComplete(request, processUpdate, taskId):
    try:
        loggerInfo.info('------------------Entering taskComplete(request,processUpdate,taskId)---------------------- ')
        if processUpdate:
            bodyData = processUpdate
        else:
            bodyData = {}
        taskId = taskId
        taskUpdateResponse = camundaClient._urllib2_request('task/' + taskId + '/complete', bodyData,
                                                            requestType='POST')
        loggerInfo.info('------------------Exiting taskComplete(request,processUpdate,taskId)---------------------- ')
        return taskUpdateResponse
    except ShgInvalidRequest, e:
        errorLog.error('Exception raised inside taskComplete(request,processUpdate, taskId): %s' % e)
        return helper.bad_request('Unexpected error occurred.')


# @decryption_required
@session_required
def getHistoryComments(request, processId):
    try:
        histCommentsDict = {}
        loggerInfo.info('------------------Entering getHistoryComments(request,processId)---------------------- ')
        historyData = camundaClient._urllib2_request('history/activity-instance?processInstanceId=' + str(processId),
                                                     {}, requestType='GET')
        if historyData[0]:
            for data in range(len(historyData)):
                if historyData[data]["activityType"] == "serviceTask" or historyData[data][
                    "activityType"] == "userTask":
                    histCommentsDict[historyData[data]["id"]] = historyData[data]
                    if historyData[data]["taskId"]:
                        commentsData = camundaClient._urllib2_request(
                            'task/' + str(historyData[data]["taskId"]) + '/comment', {}, requestType='GET')
                        histCommentsDict[historyData[data]["id"]]["comments"] = commentsData
            loggerInfo.info('------------------Exiting getHistoryComments(request,processId)---------------------- ')
            return HttpResponse(json.dumps(histCommentsDict), content_type='text/plain')
        else:
            loggerInfo.info('------------------Exiting getHistoryComments(request,processId)---------------------- ')
            return HttpResponse(json.dumps({"Message": "No data"}), content_type='text/plain')
    except ShgInvalidRequest, e:
        errorLog.error('Exception raised inside getHistoryComments(request, processId):  %s' % e)

        return helper.bad_request('Unexpected error occurred.')


# @decryption_required
@session_required
def proposalScrutinyTaskList(request):
    loggerInfo.info('------------------Entering proposalScrutinyTaskList(request)---------------------- ')
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    processInstancesQRArr = []
    processInstancesArr = []
    proposalScrutinyDict = {}
    proposalScrutinyData = []
    taskProVarList = []
    proInstArrFalse = []
    proInstArrTrue = []

    if groupName == "CreditTeam":
        bodyData = {"unassigned": "true", "candidateGroup": "CreditTeam", "name": "Proposal scrutiny"}

    if groupName == "CLM" or groupName == "BM" or groupName == "CMR":
        bodyData = {"unassigned": "true", "candidateGroup": "CLM", "name": "Upload disbursement docs"}

    proposalScrutinyList = camundaClient._urllib2_request('task', bodyData, requestType='POST')

    for data in proposalScrutinyList:
        processInstancesArr.append(data["processInstanceId"])
        proposalScrutinyDict[data["processInstanceId"]] = data
    loggerInfo.info('--------processInstancesArr---------- ')
    loggerInfo.info(processInstancesArr)
    bodyData = {"processInstanceIdIn": processInstancesArr, "variableName": "groupstatus"}
    groupStatusList = camundaClient._urllib2_request('variable-instance', bodyData, requestType='POST')

    loggerInfo.info('--------groupStatusList---------- ')
    loggerInfo.info(groupStatusList)
    for data in groupStatusList:
        if data["value"] == "false":
            proInstArrFalse.append(data["processInstanceId"])
        else:
            proInstArrTrue.append(data["processInstanceId"])

    if proInstArrFalse:
        if proInstArrFalse[0]:
            taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=false'
                                                             ,{"processInstanceIdIn": proInstArrFalse}, requestType='POST')
            taskProVarList.append(taskProVarList1)
    if proInstArrTrue:
        if proInstArrTrue[0]:
            taskProVarList2 = camundaClient._urllib2_request('variable-instance?deserializeValues=true'
                                                             ,{"processInstanceIdIn": proInstArrTrue}, requestType='POST')
            taskProVarList.append(taskProVarList2)

    for key in range(len(taskProVarList)):
        for data in taskProVarList[key]:
            if data["processInstanceId"] in proposalScrutinyDict:
                proposalScrutinyDict[data["processInstanceId"]][data["name"]] = data["value"]
            if groupName == "CreditTeam":
                if data["name"] == "chekcbrespdate":
                    if data["value"] == "resolved":
                        processInstancesQRArr.append(data["processInstanceId"])
            if groupName == "CLM" or groupName == "BM" or groupName == "CMR":
                if data["name"] == "disbursement":
                    if data["value"] == "rework":
                        processInstancesQRArr.append(data["processInstanceId"])

    taskProVarList4 = camundaClient._urllib2_request('history/process-instance',{"processInstanceIds": proInstArrTrue}, requestType='POST')
    
    for data in taskProVarList4:
        if data["id"] in proposalScrutinyDict:
            proposalScrutinyDict[data["id"]]["processStartTime"] = data["startTime"]

    for key in proposalScrutinyDict:
        if key not in processInstancesQRArr:
            proposalScrutinyData.append(proposalScrutinyDict[key])

    loggerInfo.info('------------------Exiting proposalScrutinyTaskList(request)---------------------- ')
    return HttpResponse(json.dumps(proposalScrutinyData), content_type="application/json")


def KYCTaskListByLoanType(request):
    try:
        loggerInfo.info('------------------Entering KYCTaskListByLoanType(request)---------------------- ')
        username = request.session["userName"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        userId = request.session["userId"]
        processInstancesArr = []
        groupTaskDict = {}
        groupTaskData = []
        proVarList = []
        loanTypeProInstArr = []
        proInstArrFalse = []
        proInstArrTrue = []

        grp_body_cont = {"candidateGroup": "DataSupportTeam",
                         "unassigned": "true",
                         "name": "KYC Check",
                         }
        groupTaskList = camundaClient._urllib2_request('task?firstResult=0', grp_body_cont, requestType='POST')

        for data in groupTaskList:
            processInstancesArr.append(data["processInstanceId"])
            groupTaskDict[data["processInstanceId"]] = data

        bodyData1 = {"processInstanceIdIn": processInstancesArr, "variableName": "groupstatus"}
        groupStatusList = camundaClient._urllib2_request('variable-instance', bodyData1, requestType='POST')

        for data in groupStatusList:
            if data["value"] == "false":
                proInstArrFalse.append(data["processInstanceId"])
            else:
                proInstArrTrue.append(data["processInstanceId"])

        if proInstArrFalse:
            if proInstArrFalse[0]:
                taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=false'
                                                                 ,{"processInstanceIdIn": proInstArrFalse}, requestType='POST')
                proVarList.append(taskProVarList1)
        if proInstArrTrue:
            if proInstArrTrue[0]:
                taskProVarList2 = camundaClient._urllib2_request('variable-instance?deserializeValues=true'
                                                                 ,{"processInstanceIdIn": proInstArrTrue}, requestType='POST')
                proVarList.append(taskProVarList2)

        for key in range(len(proVarList)):
            for data in proVarList[key]:
                if data["processInstanceId"] in groupTaskDict:
                    groupTaskDict[data["processInstanceId"]][data["name"]] = data["value"]
                if data["name"] == "kyc":
                    if data["value"] == "resolved":
                        loanTypeProInstArr.append(data["processInstanceId"])

            taskProVarList4 = camundaClient._urllib2_request('history/process-instance',{"processInstanceIds": proInstArrTrue}, requestType='POST')
            
        for data in taskProVarList4:
            if data["id"] in groupTaskDict:
                 groupTaskDict[data["id"]]["processStartTime"] = data["startTime"]                
                        

        for key in groupTaskDict:
            if key not in loanTypeProInstArr:
                groupTaskData.append(groupTaskDict[key])

        loggerInfo.info('------------------Exiting KYCTaskListByLoanType(request)---------------------- ')
        return HttpResponse(json.dumps(groupTaskData), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error('KYCTaskListByLoanType Exception e:  %s' % e)
        return helper.bad_request('Unexpected error occurred while getting task details.')


@session_required
def tasksCount(request):
    loggerInfo.info('------------------Entering tasksCount(request):---------------------- ')

    try:
        # loanTypeArr = ["PLL","BDL"];
        username = request.session["userName"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        officeId = userOfficeData["officeId"]
        loginUser = request.session["userLogin"]
        taskCount = {}
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
        mytaskURL = camundaClient._urllib2_request('task', {"assignee": str(loginUser)}, requestType='POST')
        urlTask = camundaClient._urllib2_request('task', bodyLocationData, requestType='POST')
        for data in mytaskURL:
            if data["name"]:
                incrementTaskCount += 1
                taskCount["myTasks"] = incrementTaskCount
            else:
                taskCount["myTasks"] = incrementTaskCount

        if groupName == "DataSupportTeam":
            KYCCheckProVarList = {"unassigned": "true",
                                  "name": "KYC Check"}
            KYCTaskCount = camundaClient._urllib2_request('task/count', KYCCheckProVarList, requestType='POST')

            queryRespProVarList = {"unassigned": "true",
                                   "processVariables": [{"name": "kyc", "value": "resolved", "operator": "eq"}],
                                   "name": "KYC Check"}
            queryRespCount = camundaClient._urllib2_request('task/count', queryRespProVarList, requestType='POST')

            taskCount["KYC Check"] = KYCTaskCount["count"] - queryRespCount["count"]
            taskCount["Query Response"] = queryRespCount["count"]

        if groupName == "CMR" or groupName == "CLM" or groupName == "BM":
            tasksArr = ["Conduct BAT- Member approval in CRM", "Upload loan documents in Web application",
                        "Resolve Data Support Team Query", "Add New Members", "Prepare Loan Documents",
                        "Resolve Credit Team Query", "Generate repayment chart", "Upload disbursement docs"]
            for taskKey in tasksArr:
                taskProList = {"unassigned": "true",
                               "processVariables": [{"name": "clusterId", "operator": "eq", "value": officeId}],
                               "name": taskKey}
                BMTaskCount = camundaClient._urllib2_request('task/count', taskProList, requestType='POST')
                taskCount[taskKey] = BMTaskCount["count"]
            uploadDisbDocList = {"unassigned": "true",
                                 "processVariables": [
                                     {"name": "disbursement", "value": "rework", "operator": "eq"}],
                                 "name": "Upload disbursement docs"}

            UDDTaskcount = camundaClient._urllib2_request('task/count', uploadDisbDocList, requestType='POST')

            taskCount["Resolve Confirm Disbursement Query"] = UDDTaskcount["count"]
            taskCount["Upload disbursement docs"] = taskCount["Upload disbursement docs"] - UDDTaskcount["count"]
            # taskCount["Prepare Loan Documents"] = taskCount["Print Loan Documents & FSR"] + taskCount["Prepare Loan Documents"]

        if groupName == "RM" or groupName == "rm":
            taskProList = {"unassigned": "true",
                           "processVariables": [{"name": "regionId", "operator": "eq", "value": officeId}],
                           "name": "Approve or Reject Group"}
            RMTaskCount = camundaClient._urllib2_request('task/count', taskProList, requestType='POST')
            taskCount["Approve or Reject Group"] = RMTaskCount["count"]

        if groupName == "CreditTeam":
            PropScrutinyProVarList = {"unassigned": "true",
                                      "name": "Proposal scrutiny"}
            PSTaskCount = camundaClient._urllib2_request('task/count', PropScrutinyProVarList, requestType='POST')

            BMReplyProVarList = {"unassigned": "true",
                                 "processVariables": [
                                     {"name": "chekcbrespdate", "value": "resolved", "operator": "eq"}],
                                 "name": "Proposal scrutiny"}
            BMReplyCount = camundaClient._urllib2_request('task/count', BMReplyProVarList, requestType='POST')

            taskCount["Proposal scrutiny"] = PSTaskCount["count"] - BMReplyCount["count"]
            taskCount["BM Reply"] = BMReplyCount["count"]

            confDisbProVarList = {"unassigned": "true",
                                  "name": "Confirm disbursement"}
            CDTaskCount = camundaClient._urllib2_request('task/count', confDisbProVarList, requestType='POST')

            CDRProVarList = {"unassigned": "true",
                             "processVariables": [
                                 {"name": "disbursement", "value": "resolved", "operator": "eq"}],
                             "name": "Confirm disbursement"}
            CDRCount = camundaClient._urllib2_request('task/count', CDRProVarList, requestType='POST')

            taskCount["Confirm disbursement"] = CDTaskCount["count"] - CDRCount["count"]
            taskCount["Confirm Disbursement Query Response"] = CDRCount["count"]
            tasksArr = ["Approve Loan"]
            for taskKey in tasksArr:
                taskProList = {"unassigned": "true",
                               "name": taskKey}
                CTTaskCount = camundaClient._urllib2_request('task/count', taskProList, requestType='POST')
                taskCount[taskKey] = CTTaskCount["count"]

        taskData = {'Task': taskCount}
        taskData = json.dumps(taskData)

        loggerInfo.info('---tasksCount--- %s ' %taskData)

        response = HttpResponse(taskData, content_type='text/plain')
        response['Content-Length'] = len(taskData)
        loggerInfo.info('---------------------Exiting tasksCount( request )-------------------- ')
        return response

    except ShgInvalidRequest, e:
        errorLog.error('Exception raised inside tasksCount(request):  %s' % e)
        return helper.bad_request('Unexpected error occurred.')


@session_required
def confDisburseQueryResponse(request):
    loggerInfo.info('----------------------Entering confDisburseQueryResponse(request):------------------ ')
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    taskProVarList = []
    processInstancesArr = []
    QRTaskDict = {}
    QRTaskData = []
    proInstArrFalse = []
    proInstArrTrue = []

    grp_body_cont = {}
    if groupName == "CreditTeam":
        grp_body_cont = {"unassigned": "true", "candidateGroup": "CreditTeam",
                         "processVariables": [{"name": "disbursement", "operator": "eq", "value": "resolved"}]}
    QRTaskList = camundaClient._request('task', grp_body_cont, requestType='POST')

    loggerInfo.info('--QRTaskList--')
    loggerInfo.info(QRTaskList)

    for data in QRTaskList:
        processInstancesArr.append(data["processInstanceId"])
        QRTaskDict[data["processInstanceId"]] = data

    bodyData = {"processInstanceIdIn": processInstancesArr, "variableName": "groupstatus"}
    groupStatusList = camundaClient._urllib2_request('variable-instance', bodyData, requestType='POST')
    for data in groupStatusList:
        if data["value"] == "false":
            proInstArrFalse.append(data["processInstanceId"])
        else:
            proInstArrTrue.append(data["processInstanceId"])

    if proInstArrFalse:
        if proInstArrFalse[0]:
            taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=false',
                                                             {"processInstanceIdIn": proInstArrFalse},
                                                             requestType='POST')
            taskProVarList.append(taskProVarList1)
    if proInstArrTrue:
        if proInstArrTrue[0]:
            taskProVarList2 = camundaClient._urllib2_request('variable-instance?deserializeValues=true',
                                                             {"processInstanceIdIn": proInstArrTrue},
                                                             requestType='POST')
            taskProVarList.append(taskProVarList2)

    for key in range(len(taskProVarList)):
        for data in taskProVarList[key]:
            if data["processInstanceId"] in QRTaskDict:
                QRTaskDict[data["processInstanceId"]][data["name"]] = data["value"]


    taskProVarList4 = camundaClient._urllib2_request('history/process-instance',{"processInstanceIds": proInstArrTrue}, requestType='POST')
    
    for data in taskProVarList4:
        if data["id"] in QRTaskDict:
            QRTaskDict[data["id"]]["processStartTime"] = data["startTime"]


    for key in QRTaskDict:
        if groupName == "CreditTeam":
            if QRTaskDict[key]["name"] == "Confirm disbursement":
                QRTaskDict[key]["name"] = "Confirm Disbursement Query Response"
            QRTaskData.append(QRTaskDict[key])
    loggerInfo.info('------------------Exiting confDisburseQueryResponse(request):---------------------- ')
    return HttpResponse(json.dumps(QRTaskData), content_type="application/json")


# @decryption_required
@session_required
def confirmDisbursement(request):
    loggerInfo.info('------------------Entering confirmDisbursement(request):---------------------- ')
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    processInstancesQRArr = []
    processInstancesArr = []
    proposalScrutinyDict = {}
    proposalScrutinyData = []
    taskProVarList = []
    proInstArrFalse = []
    proInstArrTrue = []

    if groupName == "CreditTeam":
        bodyData = {"unassigned": "true", "candidateGroup": "CreditTeam", "name": "Confirm disbursement"}

    proposalScrutinyList = camundaClient._urllib2_request('task', bodyData, requestType='POST')

    for data in proposalScrutinyList:
        processInstancesArr.append(data["processInstanceId"])
        proposalScrutinyDict[data["processInstanceId"]] = data

    loggerInfo.info('--processInstancesArr------ ')
    loggerInfo.info(processInstancesArr)
    bodyData = {"processInstanceIdIn": processInstancesArr, "variableName": "groupstatus"}
    groupStatusList = camundaClient._urllib2_request('variable-instance', bodyData, requestType='POST')

    loggerInfo.info('--groupStatusList------ ')
    loggerInfo.info(groupStatusList)

    for data in groupStatusList:
        if data["value"] == "false":
            proInstArrFalse.append(data["processInstanceId"])
        else:
            proInstArrTrue.append(data["processInstanceId"])

    if proInstArrFalse:
        if proInstArrFalse[0]:
            taskProVarList1 = camundaClient._urllib2_request('variable-instance?deserializeValues=false',
                                                             {"processInstanceIdIn": proInstArrFalse},
                                                             requestType='POST')
            taskProVarList.append(taskProVarList1)
    if proInstArrTrue:
        if proInstArrTrue[0]:
            taskProVarList2 = camundaClient._urllib2_request('variable-instance?deserializeValues=true',
                                                             {"processInstanceIdIn": proInstArrTrue},
                                                             requestType='POST')
            taskProVarList.append(taskProVarList2)

    for key in range(len(taskProVarList)):
        for data in taskProVarList[key]:
            
            if data["processInstanceId"] in proposalScrutinyDict:
                proposalScrutinyDict[data["processInstanceId"]][data["name"]] = data["value"]
            if groupName == "CreditTeam":
                if data["name"] == "disbursement":
                    if data["value"] == "resolved":
                        processInstancesQRArr.append(data["processInstanceId"])

    
    taskProVarList4 = camundaClient._urllib2_request('history/process-instance',{"processInstanceIds": proInstArrTrue}, requestType='POST')
    
    for data in taskProVarList4:
        if data["id"] in proposalScrutinyDict:
            proposalScrutinyDict[data["id"]]["processStartTime"] = data["startTime"]
                                

    for key in proposalScrutinyDict:
        if key not in processInstancesQRArr:
            proposalScrutinyData.append(proposalScrutinyDict[key])

    loggerInfo.info('------------------Exiting confirmDisbursement(request):---------------------- ')
    return HttpResponse(json.dumps(proposalScrutinyData), content_type="application/json")

