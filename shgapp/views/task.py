from django.shortcuts import render_to_response, reverse, render
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from shgapp.utils.sscoreclient import SSCoreClient
from shgapp.utils.camundaclient import CamundaClient
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *
from shgapp.views.decorator import session_required, decryption_required

import json

helper = Helper()
sscoreClient = SSCoreClient()
camundaClient = CamundaClient()

import logging

logging.basicConfig(level=logging.INFO)
loggerInfo = logging.getLogger(__name__)

logging.basicConfig(level=logging.ERROR)
errorLog = logging.getLogger(__name__)


@session_required
def dsdatecount(request):
    return render(request, 'ds-datecount.html')


@session_required
def dstasklist(request):
    loggerInfo.info('------------------Entering dstasklist(request):---------------------- ')
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    loggerInfo.info('------------------Exiting dstasklist(request):---------------------- ')
    return render(request, 'ds-tasklist.html', {"userId": userId, "group": groupName, "user": username})


# @decryption_required
@session_required
def dstasklistByName(request, taskName):
    loggerInfo.info('------------------Entering dstasklistByName(request,taskName):---------------------- ')
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    userId = request.session["userId"]
    groupName = userOfficeData["designation"]
    loggerInfo.info('------------------Exiting dstasklistByName(request,taskName):---------------------- ')
    return render(request, 'ds-tasklist.html',
                  {"userId": userId, "taskName": taskName, "group": groupName, "user": username})


def mytask(request):
    return render(request, 'ds-mytask.html')


# @decryption_required
@csrf_exempt
@session_required
def SHGForm(request, groupId, loanId, taskId, processId, taskName, loanTypeName, loanTypeId):
    loggerInfo.info(
        '------------------Entering SHGForm(request,groupId,loanId,taskId,processId,taskName,loanTypeName,loanTypeId):---------------------- ')
    try:
        username = request.session["userName"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        userId = request.session["userId"]
        templateName = {
            "KYC Check"		    				: "ds_groupview.html",
            "Query Response"        				    : "ds_groupview.html",
            "Conduct BAT- Member approval in CRM"       : "queryResponseDS.html","Upload loan documents in Web application"	: "BMUploadDocs.html",
            "Resolve Data Support Team Query"			:"queryResponseDS.html",
            "Add New Members"					        :"BMAddNewMemberRead.html",
            "Print Loan Documents & FSR"			    : "BMAddNewMember.html",
            "Prepare Loan Documents"			        : "BMAddNewMember.html",
            "Approve or Reject Group"                   : "RmGroupApproval.html",
            "Proposal scrutiny"                         : "proposalScrutiny.html",
            "BM Reply"                                  : "proposalScrutiny.html",
            "Resolve Credit Team Query"                 : "creditTeamQuery.html",
            "Approve Loan"                              : "CTLoanApproval.html",
            "Upload disbursement docs"                  : "disburseDocs.html",
            "Generate repayment chart"                  : "generateRepaymentChart.html",
            "Confirm disbursement"                       : "disburseDocsRead.html",
            "Resolve Confirm Disbursement Query"        : "disburseDocs.html",
            "Confirm Disbursement Query Response"       : "disburseDocsRead.html"

        }
        loggerInfo \
            .info('------------------Exiting SHGForm(request,groupId,loanId,taskId,processId,taskName,loanTypeName,loanTypeId):---------------------- ')
        return render(request, templateName[
                      taskName], { "userId": userId, "loanType" : loanTypeName, "loanTypeId":loanTypeId, "groupId":
                       groupId, "loanId": loanId, "processInstanceId" :processId,"taskId" : taskId, "taskName":
                       taskName, "group": groupName ,"user":username})
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside SHGForm(request,groupId,loanId,taskId,processId,taskName,loanTypeName,loanTypeId):" + e)
        return helper.bad_request('Unexpected error occurred.')

@session_required
def dashboard(request):
    loggerInfo.info('------------------Entering dashboard(request):---------------------- ')
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    loggerInfo.info('------------------Exiting dashboard(request):---------------------- ')
    return render(request, 'tatReport.html', {"userId" :userId ,"group" :groupName ,"user" :username})


@session_required
def redirectDBTasks(request,taskName):
    loggerInfo.info('------------------Entering redirectDBTasks(request):---------------------- ')
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    loggerInfo.info('------------------Exiting redirectDBTasks(request):---------------------- ')
    return render(request, 'viewDBTasks.html', {"taskName":taskName,"userId": userId, "group": groupName, "user": username})

@csrf_exempt
@session_required
def viewTasksData(request,taskName):
    loggerInfo.info('------------------Entering viewTasksData(request):---------------------- ')
    try:
        username = request.session["userName"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        userId = request.session["userId"]
        officeId = userOfficeData["officeId"]
        processList = []
        processInstancesArr = []
        proInstArrFalse = []
        proInstArrTrue = []
        bodyData = {}
        processDict = {}
        taskList = []
        processData = []
        replaceTaskName = {
            "KYC Check"                 : "Query Response",
            "Upload disbursement docs"  : "Resolve Confirm Disbursement Query",
            "Proposal scrutiny"         : "BM Reply",
            "Confirm disbursement"      : "Confirm Disbursement Query Response"
        }
        originalTasksName = {
            "KYC Check"                                 : "KYC Check",
            "Upload disbursement docs"                  : "Upload disbursement docs",
            "Proposal scrutiny"                         : "Proposal scrutiny",
            "Confirm disbursement"                      : "Confirm disbursement",
            "Query Response"                            : "KYC Check",
            "Resolve Confirm Disbursement Query"        : "Upload disbursement docs",
            "BM Reply"                                  : "Proposal scrutiny",
            "Confirm Disbursement Query Response"       : "Confirm disbursement",
            "Conduct BAT- Member approval in CRM"       : "Conduct BAT- Member approval in CRM",
            "Upload loan documents in Web application"  : "Upload loan documents in Web application",
            "Resolve Data Support Team Query"           : "Resolve Data Support Team Query",
            "Add New Members"                           : "Add New Members",
            "Prepare Loan Documents"                    : "Prepare Loan Documents",
            "Approve or Reject Group"                   : "Approve or Reject Group",
            "Resolve Credit Team Query"                 : "Resolve Credit Team Query",
            "Approve Loan"                              : "Approve Loan",
            "Generate repayment chart"                  : "Generate repayment chart"
        }
        respTasksArray = ["Query Response", "Confirm Disbursement Query Response", "Resolve Confirm Disbursement Query", "BM Reply"]
        reworkTasksArray = ["KYC Check", "Confirm disbursement", "Upload disbursement docs", "Proposal scrutiny"]

        if groupName == "CMR" or groupName == "CLM" or groupName == "BM" or groupName == "RM" or groupName == "rm" :
            if groupName == "CMR" or groupName == "CLM" or groupName == "BM":
                bodyData = {"name": originalTasksName[taskName],
                            "processVariables": [{"name": "clusterId", "operator": "eq", "value": officeId}]}
            if groupName == "RM":
                bodyData = {"name" : originalTasksName[taskName], "processVariables": [{"name": "regionId", "operator": "eq", "value": officeId}]}
            loggerInfo.info(bodyData)
            processList = camundaClient._urllib2_request('task', bodyData, requestType='POST')
            loggerInfo.info("task list")
            loggerInfo.info(processList)
            for data in processList:
                if groupName == "CMR" or groupName == "CLM" or groupName == "BM":
                    processInstancesArr.append(data["processInstanceId"])
                    dictKey = data["processInstanceId"] + "_" + data["id"]
                    processDict[dictKey] = data

                else:
                    processInstancesArr.append(data["processInstanceId"])
                    processDict[data["processInstanceId"]] = data

        if groupName == "DataSupportTeam" or groupName =="CreditTeam":
            userLogin = request.session["userLogin"]
            if groupName == "DataSupportTeam":
                bodyDataDST = {"name": "KYC Check", "taskAssignee": userLogin, "active": "true", "processUnfinished": "true"}
            if groupName =="CreditTeam":
                bodyDataDST = {"taskAssignee": userLogin, "active": "true","processUnfinished": "true"}
            myTasksDST = camundaClient._urllib2_request('history/task', bodyDataDST, requestType='POST')
            for data in myTasksDST:
                #processDict[data["processInstanceId"]] = data
                if data["processInstanceId"] not in processInstancesArr:
                    processInstancesArr.append(data["processInstanceId"])
            finalProcessArr = []
            for instance in processInstancesArr:
                taskBody = {"processInstanceId": instance}
                taskInfo = camundaClient._urllib2_request('task', taskBody, requestType='POST')
                for taskInstance in taskInfo:
                    finalProcessArr.append(taskInstance)
                    if taskInstance["name"] == originalTasksName[taskName]:
                        processDict[instance] = taskInstance


        loggerInfo.info("processDict*****************************************")
        loggerInfo.info(processDict)
        loggerInfo.info("processInstancesArr*****************************************")
        loggerInfo.info(processInstancesArr)

        bodyData1 = {"processInstanceIdIn": processInstancesArr, "variableName": "groupstatus"}
        groupStatusList = camundaClient._urllib2_request('variable-instance', bodyData1, requestType='POST')
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
                taskList.append(taskProVarList1)
        if proInstArrTrue:
            if proInstArrTrue[0]:
                taskProVarList2 = camundaClient._urllib2_request('variable-instance?deserializeValues=true',
                                                                 {"processInstanceIdIn": proInstArrTrue},
                                                                 requestType='POST')
                taskList.append(taskProVarList2)


        for key in range(len(taskList)):
            for data in taskList[key]:
                if groupName == "CMR" or groupName == "CLM" or groupName == "BM":
                    for key1 in processDict:
                        if key1.find(data["processInstanceId"]) != -1:
                            processDict[key1][data["name"]] = data["value"]
                else:
                    if data["processInstanceId"] in processDict:
                        processDict[data["processInstanceId"]][data["name"]] = data["value"]


        loggerInfo.info("processDict")
        loggerInfo.info(processDict)

        #processInstancesQRArr = []
        for key in processDict:
            if processDict[key]["name"] == "KYC Check":
                if processDict[key].has_key("kyc"):
                    if processDict[key]["kyc"] == "resolved":
                        processDict[key]["name"] = "Query Response"
                        #processInstancesQRArr.append(processDict[key]["processInstanceId"])
            if processDict[key]["name"] == "Proposal scrutiny":
                if processDict[key].has_key("chekcbrespdate"):
                    if processDict[key]["chekcbrespdate"] == "resolved":
                        processDict[key]["name"] = "BM Reply"
                        #processInstancesQRArr.append(processDict[key]["processInstanceId"])

            if processDict[key]["name"] == "Upload disbursement docs":
                if processDict[key].has_key("disbursement"):
                    if processDict[key]["disbursement"] == "rework":
                        processDict[key]["name"] = "Resolve Confirm Disbursement Query"
                        #processInstancesQRArr.append(processDict[key]["processInstanceId"])

            if processDict[key]["name"] == "Confirm disbursement":
                if processDict[key].has_key("disbursement"):
                    if processDict[key]["disbursement"] == "resolved":
                        processDict[key]["name"] = "Confirm Disbursement Query Response"
                        #processInstancesQRArr.append(processDict[key]["processInstanceId"])


        for key in processDict:
            loggerInfo.info('--------------------------------------------------------------------------------------processDict[key]')
            loggerInfo.info(processDict[key])
            if taskName == processDict[key]["name"]:
                processData.append(processDict[key])
            '''if taskName in respTasksArray:
                if key not in processInstancesQRArr and taskName == processDict[key]["name"]:
                    processData.append(processDict[key])
            elif taskName in reworkTasksArray:
                if key in processInstancesQRArr and taskName == processDict[key]["name"]:
                    processData.append(processDict[key])
            else:
                processData.append(processDict[key])'''


        loggerInfo.info('------------------Exiting viewTasksData(request,taskName):---------------------- ')
        return HttpResponse(json.dumps(processData), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside viewTasksData(request): %s" % e)
        return helper.bad_request('Unexpected error occurred.')


@session_required
def getDashboardData(request):
    loggerInfo.info('------------------Entering getDashboardData(request):---------------------- ')

    try:
        # loanTypeArr = ["PLL","BDL"];
        username = request.session["userName"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        officeId = userOfficeData["officeId"]
        loginUser = request.session["userLogin"]
        taskCount = {}
        incrementTaskCount = 0
        bodyLocationData = {}
        locationTypeId = ''


        DSTData = {}
        replaceTaskName = {
            "KYC Check" : "Query Response",
            "Upload disbursement docs": "Resolve Confirm Disbursement Query",
            "Proposal scrutiny": "BM Reply",
            "Confirm disbursement": "Confirm Disbursement Query Response"
        }
        reworkTasksArray = ["KYC Check","Upload disbursement docs","Proposal scrutiny","Confirm disbursement"]
        if groupName == "CLM" or groupName == "BM" or groupName == "CMR" or groupName == "RM" or groupName == "rm":
            if groupName == "CLM" or groupName == "BM" or groupName == "CMR":
                locationTypeId = "clusterId"
                bodyLocationData = {"processVariables": [{"name": locationTypeId, "operator": "eq", "value": officeId}]}
            if groupName == "RM" or groupName == "rm":
                locationTypeId = "regionId"
                bodyLocationData = {"processVariables": [{"name": locationTypeId, "operator": "eq", "value": officeId}]}

            reworkTasksProVarDict = {
                "KYC Check": '{"processVariables": [{"name": "kyc", "value": "resolved", "operator": "eq"}],   "name": "KYC Check"}',
                "Upload disbursement docs": '{"processVariables": [{"name": "disbursement", "value": "rework", "operator": "eq"},{"name": "' + str(
                    locationTypeId) + '", "value": "' + str(
                    officeId) + '", "operator": "eq"}],"name": "Upload disbursement docs"}',
                "Proposal scrutiny": '{"processVariables": [{"name": "chekcbrespdate", "value": "resolved", "operator": "eq"}],"name": "Proposal scrutiny"}',
                "Confirm disbursement": '{"processVariables": [{"name": "disbursement", "value": "resolved", "operator": "eq"}],"name": "Confirm disbursement"}'
            }
            myTasks = camundaClient._urllib2_request('task', bodyLocationData, requestType='POST')
            for data in myTasks:
                if data["name"] in reworkTasksArray:
                    taskProVarList = {"name": data["name"],
                                      "processVariables": [{"name": locationTypeId, "operator": "eq", "value": officeId}]}
                    overallTaskCount = camundaClient._urllib2_request('task/count', taskProVarList, requestType='POST')
                    loggerInfo.info("overallTaskCount" + str(overallTaskCount))

                    loggerInfo.info(reworkTasksProVarDict[data["name"]])
                    rwrkProVarList = json.loads(reworkTasksProVarDict[data["name"]])
                    rwrkTaskCount = camundaClient._urllib2_request('task/count', rwrkProVarList, requestType='POST')
                    loggerInfo.info("rwrkTaskCount" + str(rwrkTaskCount))
                    taskCount[data["name"]] = overallTaskCount["count"] - rwrkTaskCount["count"]
                    taskCount[replaceTaskName[data["name"]]] = rwrkTaskCount["count"]
                else:
                    if data["name"]:
                        if data["name"] in taskCount:
                            loggerInfo.info(data["name"])
                            taskCount[data["name"]] = taskCount[data["name"]] + 1
                        else:
                            taskCount[data["name"]] = incrementTaskCount + 1
                    else:
                        loggerInfo.info("inside else " + str(incrementTaskCount))
                        taskCount[data["name"]] = 0

        if groupName == "DataSupportTeam" or groupName == "CreditTeam":
            QRcount = 0
            RCDQcount = 0
            BMRcount = 0
            CDQRcount = 0
            processData = {}
            processInstancesArr = []
            userLogin = request.session["userLogin"]
            if groupName == "DataSupportTeam":
                bodyDataDST = {"name" :"KYC Check","taskAssignee" : userLogin,	"active": "true","processUnfinished" :"true"}
            if groupName == "CreditTeam":
                bodyDataDST = {"taskAssignee": userLogin, "active": "true", "processUnfinished": "true"}
            myTasksDST = camundaClient._urllib2_request('history/task', bodyDataDST, requestType='POST')
            for data in myTasksDST:
                processData[data["processInstanceId"]] = data
                if data["processInstanceId"] not in processInstancesArr:
                    processInstancesArr.append(data["processInstanceId"])
            finalProcessArr = []
            for instance in processInstancesArr:
                taskBody = {"processInstanceId" : instance}
                taskInfo = camundaClient._urllib2_request('task', taskBody, requestType='POST')
                for taskInstance in taskInfo:
                    finalProcessArr.append(taskInstance)
            loggerInfo.info("finalProcessArr------------------------*******************************************************")
            loggerInfo.info(finalProcessArr)
            for data in finalProcessArr:
                if data["name"]:
                    if data["name"] == "KYC Check":
                        queryBody = {"processInstanceId" : data["processInstanceId"] ,"processVariables": [{"name": "kyc", "value": "resolved", "operator": "eq"}],   "name": "KYC Check"}
                        queryData = camundaClient._urllib2_request('task/count', queryBody, requestType='POST')
                        if queryData["count"] != 0:

                            QRcount = QRcount+1
                    if data["name"] == "Upload disbursement docs":
                        queryBody = {"processInstanceId" : data["processInstanceId"] ,"processVariables": [{"name": "disbursement", "value": "rework", "operator": "eq"}],   "name": "Upload disbursement docs"}
                        queryData = camundaClient._urllib2_request('task/count', queryBody, requestType='POST')
                        if queryData["count"] != 0:
                            loggerInfo.info(queryData["count"])
                            RCDQcount = RCDQcount+1
                    if data["name"] == "Confirm disbursement":
                        queryBody = {"processInstanceId" : data["processInstanceId"] ,"processVariables": [{"name": "disbursement", "value": "resolved", "operator": "eq"}],   "name": "Confirm disbursement"}
                        queryData = camundaClient._urllib2_request('task/count', queryBody, requestType='POST')
                        if queryData["count"] != 0:
                            loggerInfo.info(queryData["count"])
                            CDQRcount = CDQRcount+1
                    if data["name"] == "Proposal scrutiny":
                        queryBody = {"processInstanceId" : data["processInstanceId"] ,"processVariables": [{"name": "chekcbrespdate", "value": "resolved", "operator": "eq"}],   "name": "Proposal scrutiny"}
                        queryData = camundaClient._urllib2_request('task/count', queryBody, requestType='POST')
                        if queryData["count"] != 0:
                            loggerInfo.info(queryData["count"])
                            BMRcount = BMRcount+1
                    if data["name"] in taskCount:
                        taskCount[data["name"]] = taskCount[data["name"]] + 1
                    else:
                        taskCount[data["name"]] = incrementTaskCount + 1
                else:
                    loggerInfo.info("inside else " + str(incrementTaskCount))
                    taskCount[data["name"]] = 0
            if taskCount.has_key("KYC Check"):
                taskCount["KYC Check"] = taskCount["KYC Check"] - QRcount
                taskCount["Query Response"] = QRcount
            if  taskCount.has_key("Upload disbursement docs"):
                taskCount["Upload disbursement docs"] = taskCount["Upload disbursement docs"] - RCDQcount
                taskCount["Resolve Confirm Disbursement Query"] = RCDQcount
            if taskCount.has_key("Confirm disbursement"):
                taskCount["Confirm disbursement"] = taskCount["Confirm disbursement"] - CDQRcount
                taskCount["Confirm Disbursement Query Response"] = CDQRcount
            if taskCount.has_key("Proposal scrutiny"):
                taskCount["Proposal scrutiny"] = taskCount["Proposal scrutiny"] - BMRcount
                taskCount["BM Reply"] = BMRcount

        loggerInfo.info(taskCount)
        taskData = {'Task': taskCount}
        taskData = json.dumps(taskData)
        response = HttpResponse(taskData, content_type='text/plain')
        response['Content-Length'] = len(taskData)
        loggerInfo.info('---------------------Exiting getDashboardData( request )-------------------- ')
        return response
    except ShgInvalidRequest, e:
        errorLog.error('Exception raised inside getDashboardData(request):  %s' % e)
        return helper.bad_request('Unexpected error occurred.')

@session_required
def viewGroupHistoryDB(request,groupId,loanId,taskName,loanTypeName,processInstanceId):
    loggerInfo.info('------------------Entering viewGroupHistoryDB(request,groupId,loanId,taskName,loanTypeName):---------------------- ')
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    userId = request.session["userId"]
    groupName = userOfficeData["designation"]
    loggerInfo.info('------------------ Exiting viewGroupHistoryDB(request,groupId,loanId,taskName,loanTypeName):---------------------- ')
    return render(request, 'viewGrpMembersInfo.html',
                  {"userId": userId, "taskName": taskName, "group": groupName, "user": username,"groupId": groupId, "loanId": loanId,"loanType": loanTypeName,"processInstanceId":processInstanceId})



@session_required
def getOverAllHistory(request,processInstanceId):
    loggerInfo.info('------------------Entering getOverAllHistory(request,processInstanceId):------------------- ')
    try:
        serialized_data = camundaClient._urllib2_request('history/activity-instance?processInstanceId='+str(processInstanceId), {}, requestType='GET')
        loggerInfo.info('------------------Exiting  getOverAllHistory(request,processInstanceId):--------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside  getOverAllHistory(request,processInstanceId): %s" % e)
        return helper.bad_request('Unexpected error occurred while getting history.')


# @decryption_required
@session_required
def getGroupLevelInfo(request, groupID, loanId, taskName):
    loggerInfo.info("--------------------Entering getGroupLevelInfo(request, groupID, loanId, taskName):-------------------")
    try:
        username = request.session["userName"]
        BMTasksArray = ["Generate repayment chart", "Upload disbursement docs", "Conduct BAT- Member approval in CRM",
                        "Prepare Loan Documents", "Upload loan documents in Web application", "Add New Members"]
        rwrkTasksArr = ["Resolve Data Support Team Query", "Resolve Credit Team Query",
                        "Resolve Confirm Disbursement Query"]
        DSTTasksArr = ["KYC Check", "Query Response"]
        RMTasksArr = ["Approve or Reject Group"]
        CTTasksArr = ["Proposal scrutiny",'BM Reply','Confirm disbursement',"Confirm Disbursement Query Response","Approve Loan"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        if taskName in rwrkTasksArr:
            validationLevel = "RWRK"
        if taskName in BMTasksArray:
            validationLevel = "BM"
        if taskName in DSTTasksArr:
            validationLevel = "KYC"
        if taskName in RMTasksArr:
            validationLevel = "BM"
        if taskName in CTTasksArr:
            validationLevel = "CREDITTEAM"
        bodyData = {"groupId": groupID, "validationLevel": validationLevel, "loanId": loanId}
        groupMembersData = sscoreClient._urllib2_request('workflowDetailView/getallmembers', bodyData,
                                                         requestType='POST')
        loggerInfo.info("--------------------Exiting getGroupLevelInfo(request, groupID, loanId, taskName):-------------------")
        return HttpResponse(json.dumps(groupMembersData), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside getGroupLevelInfo(request, groupID, loanId, taskName): %s" % e)
        return helper.bad_request('Unexpected error occurred while searching group.')

