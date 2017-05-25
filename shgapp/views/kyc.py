from django.shortcuts import render_to_response, reverse
from   django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from shgapp.utils.sscoreclient import SSCoreClient
from shgapp.utils.camundaclient import CamundaClient
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *
from shgapp.views.camundaViews import taskComplete
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


# @decryption_required
@session_required
def getGroupData(request, groupID, loanId, taskName):
    loggerInfo.info("--------------------Entering getGroupData(request):-------------------")
    try:
        username = request.session["userName"]
        BMTasksArray = ["Generate repayment chart", "Upload disbursement docs", "Conduct BAT- Member approval in CRM",
                        "Prepare Loan Documents", "Upload loan documents in Web application", "Add New Members"]
        rwrkTasksArr = ["Resolve Data Support Team Query", "Resolve Credit Team Query",
                        "Resolve Confirm Disbursement Query"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        if groupName == "CMR" or groupName == "CLM" or groupName == "BM":
            if taskName in rwrkTasksArr:
                validationLevel = "RWRK"
            if taskName in BMTasksArray:
                validationLevel = "BM"
        if groupName == "DataSupportTeam":
            validationLevel = "KYC"
        if groupName == "CreditTeam":
            validationLevel = "CREDITTEAM"
        if groupName == "RM" or groupName == "rm":
            validationLevel = "BM"
        bodyData = {"groupId": groupID, "validationLevel": validationLevel, "loanId": loanId}
        groupMembersData = sscoreClient._urllib2_request('workflowDetailView/getallmembers', bodyData,
                                                         requestType='POST')
        loggerInfo.info("--------------------Exiting getGroupData(request):-------------------")
        return HttpResponse(json.dumps(groupMembersData), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside getGroupData(request, groupID, loanId, taskName): %s" % e)
        return helper.bad_request('Unexpected error occurred while searching group.')


# @decryption_required
@session_required
def getIndMemberData(request, memberId, groupId, loanId, taskName):
    loggerInfo.info(
        "------------------Entering getIndMemberData(request,memberId,groupId,taskName):-----------------------")
    try:
        validationType = ''
        validationLevel = ''
        username = request.session["userName"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        if groupName == "DataSupportTeam":
            validationType = "PRE"
            validationLevel = "KYC"
        if groupName == "CMR" or groupName == "CLM" or groupName == "BM":
            if taskName == "Resolve Data Support Team Query":
                validationLevel = "RWRK"
                validationType = "POSTKYC"
            if taskName == "Conduct BAT- Member approval in CRM":
                validationLevel = "BM"
                validationType = "POSTKYC"
            if taskName == "Resolve Credit Team Query":
                validationLevel = "RWRK"
                validationType = "POST"
        if groupName == "CreditTeam":
            if taskName == "Proposal scrutiny" or taskName == "BM Reply":
                validationLevel = "CREDITTEAM"
                validationType = "CLM"
        bodyData = {"groupId": str(groupId), "memberId": str(memberId), "loanId": str(loanId),
                    "validationLevel": validationLevel, "entityType": "MEMBER", "validationType": validationType,
                    "userId": "1996"}
        IndMemberData = sscoreClient._urllib2_request('workflowDetailView/workflowMemberDetail/', bodyData,
                                                      requestType='POST')
        loggerInfo.info(
            "------------------Exiting getIndMemberData(request,memberId,groupId,taskName):-----------------------")
        return HttpResponse(json.dumps(IndMemberData), content_type="application/json")

    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside getIndMemberData(request, memberId, groupId, loanId, taskName): %s" % e)
        return helper.bad_request('Unexpected error occurred while searching group members.')


# @decryption_required
@csrf_exempt
@session_required
def getPinCodeDetails(request, pincode):
    loggerInfo.info("-------------------- Entering getPinCodeDetails(request,pincode):------------------")
    try:
        serialized_data = sscoreClient._urllib2_request('Master/VillageByPincode/' + str(pincode), {},
                                                        requestType='GET')
        loggerInfo.info("-------------------- Exiting getPinCodeDetails(request,pincode):------------------")
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside getPinCodeDetails(request, pincode):  %s" % e)
        return helper.bad_request('Unexpected error occurred while getting areas under this pincode.')


# @decryption_required
@session_required
def creditHistoryGroup(request, loanId):
    loggerInfo.info("------------------Entering creditHistoryGroup(request,loanId):-----------------")
    try:
        bodyData = {"loanId": str(loanId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/GroupCreditInquiry', bodyData,
                                                        requestType='POST')
        loggerInfo.info("------------------Exiting creditHistoryGroup(request,loanId):-----------------")
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside creditHistoryGroup(request,loanId):  %s" % e)
        return helper.bad_request('Unexpected error occurred while getting Credit History.')


# @decryption_required
@session_required
def DocumentView(request, loanId):
    loggerInfo.info("------------------Entering DocumentView(request,loanId):-----------------")
    try:
        bodyData = {"loanId": str(loanId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/LoanGroupDocument', bodyData,
                                                        requestType='POST')
        loggerInfo.info("------------------Exiting DocumentView(request,loanId):-----------------")
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside DocumentView(request,loanId):  %s" % e)
        return helper.bad_request('An expected error occurred while getting Documents')


@csrf_exempt
@session_required
def updateKYCDetails(request):
    loggerInfo.info("------------------Entering updateKYCDetails(request):----------------")
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyDataUpdation = formData["formData"]

            bodymemberValidation = formData["memValData"]
            taskId = formData["taskId"]

            dataUpdateResponse = sscoreClient._urllib2_request('workflowEdit/updateMemberGroupLoan', bodyDataUpdation,
                                                               requestType='POST')
            memberValResponse = sscoreClient._urllib2_request('workflowEdit/memberValidation', bodymemberValidation,
                                                              requestType='POST')

            if memberValResponse["data"]["status"] != "fail":
                if formData.has_key("message"):
                    message = {"message": formData["message"]}
                    commentUpdate = camundaClient._urllib2_request('task/' + taskId + '/comment/create', message,
                                                                   requestType='POST')
                loggerInfo.info("------------------Exiting updateKYCDetails(request):----------------")
                return HttpResponse(json.dumps(dataUpdateResponse), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside updateKYCDetails(request):  %s" % e)
        return helper.bad_request('Unexpected error occurred while updating the KYC details.')


@csrf_exempt
@session_required
def updateMemValidationStatus(request):
    loggerInfo.info("------------------ Entering updateMemValidationStatus(request):-----------------")
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodymemberValidation = formData["memValData"]
            taskId = formData["taskId"]

            memberValResponse = sscoreClient._urllib2_request('workflowEdit/memberValidation', bodymemberValidation,
                                                              requestType='POST')
            if formData.has_key("message"):
                message = {"message": formData["message"]}
                commentUpdate = camundaClient._urllib2_request('task/' + taskId + '/comment/create', message,
                                                               requestType='POST')
            validationResponse = memberValResponse
            loggerInfo.info("------------------Exiting updateMemValidationStatus(request):-----------------")
            return HttpResponse(json.dumps(validationResponse), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside updateMemValidationStatus(request):  %s" % e)
        return helper.bad_request('Unexpected error occurred while updating the KYC details.')


@session_required
def creditHistory(request, groupId):
    loggerInfo.info("------------------Entering creditHistory(request,groupid):-----------------")
    try:
        bodyData = {"groupId": str(groupId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/CreditEnquiry', bodyData,
                                                        requestType='POST')
        loggerInfo.info("------------------Exiting creditHistory(request,groupid):-----------------")
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside creditHistory(request,groupid):  %s" % e)
        return helper.bad_request('Unexpected error occurred while getting Credit History.')


@csrf_exempt
@session_required
def updateUrl(request):
    loggerInfo.info('------------------Entering updateUrl(request):-----------------')
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyData = formData["uploadData"]
            serialized_data = sscoreClient._urllib2_request('UploadDocument/add', bodyData, requestType='POST')
            loggerInfo.info('------------------Exiting updateUrl(request):-----------------')
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside updateUrl(request):  %s" % e)
        return helper.bad_request('An expected error occurred while Updating Url details.')


# @decryption_required
@csrf_exempt
@session_required
def loanDocument(request, loanTypeId):
    loggerInfo.info('------------------Entering loanDocument(request,loanTypeId):-----------------')
    try:
        serialized_data = sscoreClient._urllib2_request('Master/LoanDocuments/' + str(loanTypeId), {},
                                                        requestType='GET')
        loggerInfo.info('------------------Exiting loanDocument(request,loanTypeId):-----------------')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside loanDocument(request,loanTypeId): %s" % e)
        return helper.bad_request('Unexpected error occurred while getting loanDocument details.')


@csrf_exempt
@session_required
def editUrl(request):
    loggerInfo.info('------------------Entering editUrl(request):-----------------')
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyData = formData["uploadData"]
            serialized_data = sscoreClient._urllib2_request('UploadDocument/update', bodyData, requestType='POST')
            loggerInfo.info('------------------Exiting editUrl(request):-----------------')
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside editUrl(request): %s" % e)
        return helper.bad_request('An expected error occurred while Editing Url details.')


# @decryption_required
@csrf_exempt
@session_required
def getLoanDetails(request, groupId, loanId):
    loggerInfo.info('------------------Entering getLoanDetails(request,groupId,loanId):----------------------')
    try:
        bodyData = {"groupId": str(groupId), "loanId": str(loanId), "entityType": "LOAN", "validationType": "POST"}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/workflowLoanDetail', bodyData,
                                                        requestType='POST')
        loggerInfo.info('------------------Exiting getLoanDetails(request,groupId,loanId):----------------------')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside getLoanDetails(request,groupId,loanId): %s" % e)
        return helper.bad_request('Unexpected error occurred while getting getLoanDetails')


@csrf_exempt
@session_required
def dropMemberDetail(request):
    loggerInfo.info('------------------Entering dropMemberDetail(request):----------------------')
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyData = formData["uploadData"]
            serialized_data = sscoreClient._urllib2_request('workflowEdit/dropMember', bodyData, requestType='POST')
            loggerInfo.info('------------------Exiting dropMemberDetail(request):----------------------')
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside dropMemberDetail(request): %s" % e)
        return helper.bad_request('An expected error occurred while  dropMemberDetail.')


@csrf_exempt
@session_required
def updateloanDetail(request):
    loggerInfo.info('------------------Entering updateloanDetail(request):----------------------')
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyData = formData["uploadData"]
            print "bodyData"
            print json.dumps(bodyData)
            serialized_data = sscoreClient._urllib2_request('workflowEdit/updateMemberLoan', bodyData,
                                                            requestType='POST')
            loggerInfo.info('------------------Exiting updateloanDetail(request):----------------------')
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside updateloanDetail(request): %s" % e)
        return helper.bad_request('An expected error occurred while updateloanDetail.')


@csrf_exempt
@session_required
def approveLoan(request):
    loggerInfo.info('------------------Entering approveLoan(request):---------------------- ')
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyData = formData["loanData"]
            taskId = formData["taskId"]
            print bodyData

            serialized_data = sscoreClient._urllib2_request('workflowEdit/loanValidation', bodyData,
                                                            requestType='POST')
            print "serialized_data-------------------------------"
            print serialized_data
            if serialized_data["code"] == 2043:
                processUpdate = {'variables': {'dispatchType': {'value': "Cheque"},
                                               'groupinstance': {'value': "creditapproved"},
                                               'loanAccNo': {'value': serialized_data["data"]["loanAccountNumber"]}
                                               }
                                 }
                taskComplete(request, processUpdate, taskId)
            loggerInfo.info('------------------Exiting approveLoan(request):---------------------- ')
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside approveLoan(request): %s" % e)
        return helper.bad_request('An expected error occurred while approving loan.')


# @decryption_required
@session_required
def loanAccNo(request, loanAccNumber, appGroupId, loanTypeName, groupName, funder, successMsg):
    username = request.session["userName"]
    print "funder"
    print funder
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupRole = userOfficeData["designation"]
    userId = request.session["userId"]
    return render_to_response("loanAccNumber.html",
                              {"user": username, "successMsg": successMsg, "funder": json.dumps(funder),
                               "userId": userId, "group": groupRole, "groupName": groupName, "appGroupId": appGroupId,
                               "loanTypeName": loanTypeName, "loanAccNo": loanAccNumber})


# @decryption_required
@session_required
def getMemberFSR(request, memberId):
    loggerInfo.info('------------------Entering getMemberFSR(request,memberId):---------------------- ')
    try:
        bodyData = {"memberId": str(memberId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/MemberFsr', bodyData, requestType='POST')
        loggerInfo.info('------------------Exiting getMemberFSR(request,memberId):---------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside approveLoan(request): %s" % e)
        return helper.bad_request('Unexpected error occurred while getting Member FSR.')


@session_required
def getMemberComments(request, processId, loanId):
    loggerInfo.info('------------------Entering getMemberComments(request, processId, loanId):---------------------- ')
    try:
        bodyData = {"processId": str(processId), "loanId": str(loanId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/MemberComments', bodyData,
                                                        requestType='POST')
        loggerInfo.info(
            '------------------Exiting getMemberComments(request, processId, loanId):---------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside getMemberComments(request, processId, loanId): %s" % e)
        return helper.bad_request('Unexpected error occurred while getting getMemberComments')


@session_required
def getGroupComments(request, processId, loanId):
    loggerInfo.info('------------------Entering getGroupComments(request, processId, loanId):---------------------- ')
    try:
        bodyData = {"processId": str(processId), "loanId": str(loanId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/GroupComments', bodyData,
                                                        requestType='POST')
        loggerInfo.info(
            '------------------Exiting getGroupComments(request, processId, loanId):---------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside getGroupComments(request, processId, loanId): %s" % e)
        return helper.bad_request('Unexpected error occurred while getting getGroupComments')


@csrf_exempt
@session_required
def getLoanMemberPaymentHistory(request, memberId, groupId):
    loggerInfo.info(
        '------------------Entering getLoanMemberPaymentHistory(request, memberId, groupId):---------------------- ')
    try:
        bodyData = {"memberIds": [str(memberId)], "groupId": str(groupId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/LoanMemberPaymentHistory', bodyData,
                                                        requestType='POST')
        loggerInfo.info(
            '------------------Exiting getLoanMemberPaymentHistory(request, memberId, groupId):---------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside getLoanMemberPaymentHistory(request, memberId, groupId): %s" % e)
        return helper.bad_request('Unexpected error occurred while getting Loan Member PaymentHistory.')


@csrf_exempt
@session_required
def getLoanGroupPaymentHistory(request, groupId):
    loggerInfo.info('------------------Entering getLoanGroupPaymentHistory(request, groupId):---------------------- ')
    try:
        bodyData = {"groupId": str(groupId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/AllMembersLoanPaymentHistory', bodyData,
                                                        requestType='POST')
        loggerInfo.info(
            '------------------Exiting getLoanGroupPaymentHistory(request, groupId):---------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside getLoanGroupPaymentHistory(request, groupId): %s" % e)
        return helper.bad_request('Unexpected error occurred while getting Loan group PaymentHistory.')


@csrf_exempt
@session_required
def generateLOS(request):
    loggerInfo.info('------------------Entering generateLOS(request):---------------------- ')
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyData = formData["losData"]
            if 'userOfficeData' in request.session:
                userData = json.loads(request.session["userOfficeData"])
                bodyData["officeTypeId"] = userData["officeTypeId"]
                bodyData["officeId"] = userData["officeId"]
            serialized_data = sscoreClient._urllib2_request('losDoc/generate', bodyData,
                                                            requestType='POST')
            loggerInfo.info('------------------Exiting generateLOS(request):---------------------- ')
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside generateLOS(request): %s" % e)
        return helper.bad_request('Unexpected error occurred while generating LOS.')


@session_required
def disburseDocsData(request, loanId):
    loggerInfo.info('------------------Entering disburseDocsData(request, loanId):---------------------- ')
    try:
        bodyData = {"loanId": str(loanId)}
        serialized_data = sscoreClient._urllib2_request('ChequeDisbursement/MemberDetails', bodyData,
                                                        requestType='POST')
        loggerInfo.info('------------------Exiting disburseDocsData(request, loanId):---------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside disburseDocsData(request, loanId): %s" % e)
        return helper.bad_request('Unexpected error occurred while getting disburse doc details')


@csrf_exempt
@session_required
def updateDisburseMemberData(request):
    loggerInfo.info('------------------Entering updateDisburseMemberData(request):---------------------- ')
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyData = formData["cheqData"]
            serialized_data = sscoreClient._urllib2_request('ChequeDisbursement/SaveOrUpdateMemberDetails', bodyData,
                                                            requestType='POST')
            loggerInfo.info('------------------Exiting updateDisburseMemberData(request):---------------------- ')
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside updateDisburseMemberData(request): %s" % e)
        return helper.bad_request('Unexpected error occurred while updating disburse doc details')


@csrf_exempt
@session_required
def confirmChqDisbursement(request):
    loggerInfo.info('------------------Entering confirmChqDisbursement(request):--------------------- ')
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyData = formData["cheqData"]
            taskId = formData["taskId"]
            processUpdate = formData["processUpdate"]
            print "processUpdate"
            print processUpdate

            serialized_data = sscoreClient._urllib2_request('ChequeDisbursement/MemberCancellation', bodyData,
                                                            requestType='POST')

            if serialized_data["code"] == 12002:
                taskComplete(request, processUpdate, taskId)
            loggerInfo.info('------------------Exiting confirmChqDisbursement(request):--------------------- ')
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside confirmChqDisbursement(request): %s" % e)
        return helper.bad_request('Unexpected error occurred while confirming disbursement')


@session_required
def chkTaskState(request, taskId):
    loggerInfo.info('------------------Entering chkTaskState(request, taskId):--------------------- ')
    try:
        serialized_data = camundaClient._urllib2_request('task/' + taskId, {}, requestType='GET')
        loggerInfo.info('------------------Entering chkTaskState(request, taskId):--------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside chkTaskState(request, taskId): %s" % e)
        return HttpResponse(json.dumps({"message": "No matching task with id " + taskId}),
                            content_type="application/json")


@session_required
def LoanActiveMemberCount(request, loanId):
    loggerInfo.info('------------------Entering LoanActiveMemberCount(request, loanId):--------------------- ')
    try:
        bodyData = {"loanId": str(loanId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/LoanActiveMemberCount', bodyData,
                                                        requestType='POST')
        loggerInfo.info('------------------Exiting LoanActiveMemberCount(request, loanId):--------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside LoanActiveMemberCount(request, loanId): %s" % e)
        return helper.bad_request('Unexpected error occurred while getting LoanActiveMemberCount ')


def getLoanAccNo(request, processId):
    loggerInfo.info('------------------Entering getLoanAccNo(request, processId):--------------------- ')
    try:
        bodyData = {"variableName": "loanAccNo", "processInstanceIdIn": [processId]}
        serialized_data = camundaClient._urllib2_request('variable-instance', bodyData, requestType='POST')
        loggerInfo.info('------------------Exiting getLoanAccNo(request, processId):--------------------- ')
        return HttpResponse(json.dumps({"loanAccNo": serialized_data[0]["value"]}), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside getLoanAccNo(request, processId): %s" % e)
        return helper.bad_request('Unexpected error occurred while getting loanaccount number')


def getAddNewMemTaskInfo(request, groupId, loanId,processId):
    try:
        loggerInfo.info("--------------------Entering getAddNewMemTaskInfo(request, groupId, loanId,processId):-------------------")
        validationLevel = ''
        histBody = {"activityName": "Conduct BAT- Member approval in CRM", "processInstanceId": processId}
        histInfo = camundaClient._urllib2_request('history/activity-instance', histBody, requestType='POST')
        loggerInfo.info(histInfo)
        if histInfo and histInfo[0]:
             validationLevel = "BM"
        else:
            validationLevel = "KYC"
        loggerInfo.info(validationLevel)
        bodyData = {"groupId": groupId, "validationLevel": validationLevel, "loanId": loanId}
        groupMembersData = sscoreClient._urllib2_request('workflowDetailView/getallmembers', bodyData,
                                                         requestType='POST')
        loggerInfo.info("--------------------Exiting getAddNewMemTaskInfo(request, groupId, loanId,processId):-------------------")
        return HttpResponse(json.dumps(groupMembersData), content_type="application/json")

    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside getGroupData(request, groupID, loanId, taskName): %s" % e)
        return helper.bad_request('Unexpected error occurred while searching group.')

@csrf_exempt
@session_required
def getmemberConflictHist(request,memberId):
    loggerInfo.info('------------------Entering getmemberConflictHist(request,memberId):--------------------- ')
    try:
        bodyData = {"memberId": str(memberId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/ConflictMembers', bodyData,
                                                        requestType='POST')
        loggerInfo.info('------------------Exiting getmemberConflictHist(request, memberId):--------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside getmemberConflictHist(request,memberId): %s" % e)
        return helper.bad_request('Unexpected error occurred while getting member conflict history ')

@csrf_exempt
@session_required
def getmemberCreditEnq(request,memberId,loanId):
    loggerInfo.info('------------------Entering getmemberCreditEnq(request,memberId,loanId):--------------------- ')
    try:
        bodyData = {"memberId": str(memberId),"loanId": str(loanId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/MemberCreditEnquiry', bodyData,
                                                        requestType='POST')
        loggerInfo.info('------------------Exiting getmemberCreditEnq(request,memberId,loanId):-------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside getmemberCreditEnq(request,,memberId,loanId): %s" % e)
        return helper.bad_request('Unexpected error occurred while getting member credit history ')



@csrf_exempt
@session_required
def getSHGPaymentHistory(request, groupId):
    loggerInfo.info('------------------Entering getSHGPaymentHistory(request, groupId):---------------------- ')
    try:
        bodyData = {"groupId": str(groupId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/GroupLoanPaymentHistory', bodyData,
                                                        requestType='POST')
        loggerInfo.info(
            '------------------Exiting getSHGPaymentHistory(request, groupId):---------------------- ')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside getSHGPaymentHistory(request, groupId): %s" % e)
        return helper.bad_request('Unexpected error occurred while getting Loan group SHG PaymentHistory.')