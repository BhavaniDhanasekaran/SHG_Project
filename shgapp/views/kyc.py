from django.shortcuts import render_to_response,reverse
from   django.views.decorators.csrf  import csrf_exempt
from django.http import HttpResponse
from shgapp.utils.sscoreclient import SSCoreClient
from shgapp.utils.camundaclient import CamundaClient
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *
from shgapp.views.camundaViews import taskComplete
from shgapp.views.decorator import session_required,decryption_required

import json

helper = Helper()
sscoreClient = SSCoreClient()
camundaClient = CamundaClient()

#@decryption_required
@session_required
def getGroupData(request,groupID,loanId,taskName):
    print "Inside getGroupData(request):"
    try:
        username = request.session["userName"]
        BMTasksArray = ["Conduct BAT- Member approval in CRM","Print Loan Documents & FSR","Prepare Loan Documents","Upload loan documents in Web application","Add New Members"]
        rwrkTasksArr = ["Resolve Data Support Team Query","Resolve Credit Team Query"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        if groupName== "CMR" or groupName == "CLM" or groupName == "BM":
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
        bodyData = {"groupId": groupID, "validationLevel":validationLevel, "loanId":loanId}
        groupMembersData = sscoreClient._urllib2_request('workflowDetailView/getallmembers', bodyData, requestType='POST')
        return HttpResponse(json.dumps(groupMembersData), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while searching group.')

#@decryption_required
@session_required
def getIndMemberData(request,memberId,groupId,loanId,taskName):
    print "Inside getIndMemberData(request,memberId,groupId,taskName):"
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
        bodyData = { "groupId": str(groupId), "memberId":str(memberId),  "loanId": str(loanId), "validationLevel" : validationLevel, "entityType": "MEMBER","validationType": validationType, "userId": "1996" }
        IndMemberData = sscoreClient._urllib2_request('workflowDetailView/workflowMemberDetail/', bodyData, requestType='POST')
        return HttpResponse(json.dumps(IndMemberData), content_type="application/json")

    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while searching group members.')

#@decryption_required
@csrf_exempt
@session_required
def getPinCodeDetails(request,pincode):
    print "Inside getPinCodeDetails(request,pincode):"
    try:
        serialized_data = sscoreClient._urllib2_request('Master/VillageByPincode/'+str(pincode),{},requestType='GET')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting areas under this pincode.')


#@decryption_required
@session_required
def creditHistoryGroup(request,loanId):
    loanId = loanId
    print 'Inside creditHistoryGroup(request,loanId):'
    try:
        bodyData = { "loanId" : str(loanId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/GroupCreditInquiry', bodyData ,requestType='POST')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting Credit History.')

#@decryption_required
@session_required
def DocumentView(request,loanId):
    print "Inside DocumentView(request,loanId):"
    try:
        bodyData = { "loanId" : str(loanId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/LoanGroupDocument', bodyData ,requestType='POST')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while getting Documents')

@csrf_exempt
@session_required
def updateKYCDetails(request):
    print "Inside updateKYCDetails(request):"
    try:
        if request.method == "POST":
            formData  = json.loads(request.body)
            bodyDataUpdation =  formData["formData"]

            bodymemberValidation =  formData["memValData"]
            taskId = formData["taskId"]

            dataUpdateResponse = sscoreClient._urllib2_request('workflowEdit/updateMemberGroupLoan', bodyDataUpdation,
                                                               requestType='POST')
            memberValResponse = sscoreClient._urllib2_request('workflowEdit/memberValidation',bodymemberValidation,requestType='POST')

            if memberValResponse["data"]["status"] != "fail":
                if formData.has_key("message"):
                    message = {"message" : formData["message"]}
                    commentUpdate = camundaClient._urllib2_request('task/'+taskId+'/comment/create',message,requestType='POST')
                return HttpResponse(json.dumps(dataUpdateResponse), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while updating the KYC details.')


@csrf_exempt
@session_required
def updateMemValidationStatus(request):
    print "Inside updateMemValidationStatus(request):"
    try:
        if request.method == "POST":
            formData  = json.loads(request.body)
            bodymemberValidation =  formData["memValData"]
            taskId = formData["taskId"]

            memberValResponse = sscoreClient._urllib2_request('workflowEdit/memberValidation',bodymemberValidation,requestType='POST')
            if formData.has_key("message"):
                message = {"message" : formData["message"]}
                commentUpdate = camundaClient._urllib2_request('task/'+taskId+'/comment/create',message,requestType='POST')
            validationResponse =  memberValResponse
            return HttpResponse(json.dumps(validationResponse), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while updating the KYC details.')

@session_required
def creditHistory(request,groupId):
    print "Inside creditHistory(request,groupid):"
    try:
        bodyData = { "groupId" : str(groupId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/CreditEnquiry', bodyData ,requestType='POST')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting Credit History.')

@csrf_exempt
@session_required
def updateUrl(request):
    print "Inside updateUrl(request):"
    try:
        if request.method == "POST":
            formData  = json.loads(request.body)
            bodyData = formData["uploadData"]
            serialized_data = sscoreClient._urllib2_request('UploadDocument/add', bodyData ,requestType='POST')
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while Updating Url details.')

#@decryption_required
@csrf_exempt
@session_required
def loanDocument(request,loanTypeId):
    print "Inside getloanDocument(request,loanTypeId):"
    try:
        serialized_data = sscoreClient._urllib2_request('Master/LoanDocuments/'+str(loanTypeId),{},requestType='GET')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting loanDocument details.')


@csrf_exempt
@session_required
def editUrl(request):
    print "Inside editUrl(request):"
    try:
        if request.method == "POST":
            formData  = json.loads(request.body)
            bodyData = formData["uploadData"]
            serialized_data = sscoreClient._urllib2_request('UploadDocument/update', bodyData,requestType='POST')
            return HttpResponse(json.dumps(serialized_data),content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while Editing Url details.')


#@decryption_required
@csrf_exempt
@session_required
def getLoanDetails(request, groupId, loanId):
    print 'Inside getLoanDetails(request,groupId,loanId):'
    try:
        bodyData = {"groupId": str(groupId), "loanId": str(loanId), "entityType": "LOAN", "validationType": "POST"}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/workflowLoanDetail', bodyData,
                                                        requestType='POST')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting getLoanDetails')

@csrf_exempt
@session_required
def dropMemberDetail(request):
    print "Inside dropMemberDetail(request):"
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyData = formData["uploadData"]
            serialized_data = sscoreClient._urllib2_request('workflowEdit/dropMember', bodyData, requestType='POST')
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while  dropMemberDetail.')

@csrf_exempt
@session_required
def updateloanDetail(request):
    print "Inside updateloanDetail(request):"
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyData = formData["uploadData"]
            print "bodyData"
            print json.dumps(bodyData)
            serialized_data = sscoreClient._urllib2_request('workflowEdit/updateMemberLoan', bodyData,
                                                            requestType='POST')
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while updateloanDetail.')

@csrf_exempt
@session_required
def approveLoan(request):
    print "Inside approveLoan(request): "
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyData = formData["loanData"]
            taskId = formData["taskId"]
            serialized_data = sscoreClient._urllib2_request('workflowEdit/loanValidation', bodyData,
                                                            requestType='POST')
            print "serialized_data-------------------------------"
            print serialized_data
            if serialized_data["code"] == 2043 :
                processUpdate = { 'variables': { 'dispatchType': { 'value': "Cheque" } } }
                taskComplete(request,processUpdate,taskId)
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while approving loan.')

#@decryption_required
@session_required
def loanAccNo(request,loanAccNumber,appGroupId,loanTypeName,groupName,funder,successMsg):
    username = request.session["userName"]
    print "funder"
    print funder
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupRole = userOfficeData["designation"]
    userId = request.session["userId"]
    return render_to_response("loanAccNumber.html",{"user":username,"successMsg":successMsg,"funder":json.dumps(funder),"userId":userId,"group":groupRole,"groupName": groupName,"appGroupId" :appGroupId,"loanTypeName":loanTypeName,"loanAccNo":loanAccNumber})


#@decryption_required
@session_required
def getMemberFSR(request,memberId):
    print 'Inside MemberFSR(request,memberId):'
    try:
        bodyData = { "memberId" : str(memberId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/MemberFsr', bodyData ,requestType='POST')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting Member FSR.')


@session_required
def getMemberComments(request, processId, loanId):
    print 'Inside getLoanDetails(request,processId,loanId):'
    try:
        bodyData = {"processId": str(processId), "loanId": str(loanId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/MemberComments', bodyData,
                                                        requestType='POST')

        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting getMemberComments')


@session_required
def getGroupComments(request, processId, loanId):
    print 'Inside getGroupComments(request,processId,loanId):'
    try:
        bodyData = {"processId": str(processId), "loanId": str(loanId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/GroupComments', bodyData,
                                                        requestType='POST')

        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting getGroupComments')

@csrf_exempt
@session_required
def getLoanMemberPaymentHistory(request,memberId,groupId):
    print 'Inside LoanMemberPaymentHistory(request,memberIds,groupId):'
    try:
        bodyData = { "memberIds" : [str(memberId)], "groupId" : str(groupId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/LoanMemberPaymentHistory', bodyData ,requestType='POST')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting Loan Member PaymentHistory.')

@csrf_exempt
@session_required
def getLoanGroupPaymentHistory(request,groupId):
    print 'Inside getLoanGroupPaymentHistory(request,memberIds,groupId):'
    try:
        bodyData = { "groupId" : str(groupId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/AllMembersLoanPaymentHistory', bodyData ,requestType='POST')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting Loan group PaymentHistory.')


@csrf_exempt
@session_required
def generateLOS(request):
    print 'Inside generateLOS(request):'
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyData = formData["losData"]
            if 'userOfficeData' in request.session:
                userData = json.loads(request.session["userOfficeData"])
                bodyData["officeTypeId"] =userData["officeTypeId"]
                bodyData["officeId"] = userData["officeId"]
            serialized_data = sscoreClient._urllib2_request('losDoc/generate', bodyData,
                                                            requestType='POST')
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while generating LOS.')

@session_required
def disburseDocsData(request,loanId):
    print 'Inside disburseDocsData(request):'
    try:
        bodyData = {"loanId": str(loanId)}
        serialized_data = sscoreClient._urllib2_request('ChequeDisbursement/MemberDetails', bodyData,
                                                        requestType='POST')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting disburse doc details')
