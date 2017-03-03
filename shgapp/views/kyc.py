from django.shortcuts import render,render_to_response,reverse
from django.views.decorators import csrf
from   django.views.decorators.csrf  import csrf_protect, csrf_exempt
from django.http import HttpResponseRedirect,HttpResponse,JsonResponse
from django.conf import settings as django_settings
from shgapp.utils.sscoreclient import SSCoreClient
from shgapp.utils.camundaclient import CamundaClient
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *
from shgapp.views.camundaViews import taskComplete
import json
import urllib2
import requests

helper = Helper()
sscoreClient = SSCoreClient()
camundaClient = CamundaClient()

@csrf_exempt
def dsgroupview(request,groupID,loanID,taskId,processInstanceId):
    username = request.user
    print processInstanceId
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)
    print "grp:"
    print groups[0]
    return render_to_response( 'ds_groupview.html', {"groupId": groupID,"loanId":loanID,"processInstanceId" :processInstanceId, "taskId" : taskId,"group":groups[0],"user":username})


def dsgroupview2(request):
    print "Inside dsgroupview2(request):"
    username = request.user
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)
    print "grp:"
    print groups[0]
    return render_to_response('ds_groupview.html',{"group":groups[0],"user":username})

def groupViewQuery2(request,groupID,loanID,taskId,processInstanceId):
    username = request.user
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)
    print "grp:"
    print groups[0]
    return render_to_response( 'queryResponseDS.html', {"groupId": groupID,"loanId":loanID,"processInstanceId" :processInstanceId, "taskId" : taskId,"group":groups[0],"user":username})

def groupViewQuery(request):
    username = request.user
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)
    print "grp:"
    print groups[0]
    return render(request, 'queryResponseDS.html',{"group":groups[0],"user":username})


def getGroupData(request,groupID,taskName):
    print "Inside getGroupData(request):"
    try:
        username = request.user
        Grp = request.user.groups.all()
        url = ''
        groups = request.user.groups.values_list('name', flat=True)
        if groups[0] == "CLM_BM" or groups[0] == "CLM":
            if taskName == "Resolve Data Support Team Query":
                validationLevel = "RWRK"
            if taskName == "Conduct BAT- Member approval in CRM":
                validationLevel = "BM"
            if taskName == "Resolve Credit Team Query":
                validationLevel = "RWRK"
        if groups[0] == "DataSupportTeam":
            validationLevel = "KYC"
        if groups[0] == "CreditTeam":
            validationLevel = "CREDITTEAM"
        if groups[0] == "RM" or groups[0] == "rm":
            validationLevel = "BM"
        bodyData = {"groupId": groupID, "validationLevel":validationLevel}
        groupMembersData = sscoreClient._urllib2_request('workflowDetailView/getallmembers', bodyData, requestType='POST')
        return HttpResponse(json.dumps(groupMembersData), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while searching group.')

def getIndMemberData(request,memberId,groupId,loanId,taskName):
    print "Inside getIndMemberData(request,memberId,groupId,taskName):"
    try:
        validationType = ''
        print taskName
        username = request.user
        Grp = request.user.groups.all()
        validationLevel = ""
        groups = request.user.groups.values_list('name',flat=True)
        groupName = groups[0]
        if groupName == "DataSupportTeam":
            validationType = "PRE"
            validationLevel = "KYC"
        if groupName == "CLM_BM" or groupName == "CLM":
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


@csrf_exempt
def getPinCodeDetails(request,pincode):
    print "Inside getPinCodeDetails(request,pincode):"
    try:
        serialized_data = sscoreClient._urllib2_request('Master/VillageByPincode/'+str(pincode),{},requestType='GET')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting areas under this pincode.')


def creditHistory(request,loanId):
    loanId = loanId
    print 'Inside creditHistory(request,loanId):'
    try:
        bodyData = { "loanId" : str(loanId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/GroupCreditInquiry', bodyData ,requestType='POST')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting Credit History.')

def creditHistoryGroup(request,loanId):
    loanId = loanId
    print 'Inside creditHistoryGroup(request,loanId):'
    try:
        bodyData = { "loanId" : str(loanId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/GroupCreditInquiry', bodyData ,requestType='POST')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting Credit History.')

def DocumentView(request,loanId):
    print "Inside DocumentView(request,loanId):"
    try:
        bodyData = { "loanId" : str(loanId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/LoanGroupDocument', bodyData ,requestType='POST')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while getting Documents')

@csrf_exempt
def updateKYCDetails(request):
    print "Inside updateKYCDetails(request):"
    try:
        if request.method == "POST":
            formData  = json.loads(request.body)
            bodyDataUpdation =  formData["formData"]
            bodymemberValidation =  formData["memValData"]
            taskId = formData["taskId"]

            memberValResponse = sscoreClient._urllib2_request('workflowEdit/memberValidation',bodymemberValidation,requestType='POST')

            if memberValResponse["data"]["status"] != "fail":
                if formData.has_key("message"):
                    message = {"message" : formData["message"]}
                    commentUpdate = camundaClient._urllib2_request('task/'+taskId+'/comment/create',message,requestType='POST')
                dataUpdateResponse = sscoreClient._urllib2_request('workflowEdit/updateMemberGroupLoan',bodyDataUpdation,requestType='POST')
                return HttpResponse(json.dumps(dataUpdateResponse), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while updating the KYC details.')


@csrf_exempt
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


def creditHistory(request,groupId):
    print "Inside creditHistory(request,groupid):"
    try:
        bodyData = { "groupId" : str(groupId)}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/CreditEnquiry', bodyData ,requestType='POST')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting Credit History.')

@csrf_exempt
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


@csrf_exempt
def loanDocument(request,loanTypeId):
    print "Inside getloanDocument(request,loanTypeId):"
    try:
        serialized_data = sscoreClient._urllib2_request('Master/LoanDocuments/'+str(loanTypeId),{},requestType='GET')
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting loanDocument details.')


@csrf_exempt
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


@csrf_exempt
def getLoanDetails(request, groupId, loanId):
    print 'Inside getLoanDetails(request,groupId,loanId):'
    try:
        bodyData = {"groupId": str(groupId), "loanId": str(loanId), "entityType": "LOAN", "validationType": "POST"}
        serialized_data = sscoreClient._urllib2_request('workflowDetailView/workflowLoanDetail', bodyData,
                                                        requestType='POST')
        print "serialized_data"
        print serialized_data
        return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting getLoanDetails')

@csrf_exempt
def dropMemberDetail(request):
    print "Inside dropMemberDetail(request):"
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyData = formData["uploadData"]
            print  bodyData
            serialized_data = sscoreClient._urllib2_request('workflowEdit/dropMember', bodyData, requestType='POST')
            print "serialized_data editurl"
            print serialized_data
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while  dropMemberDetail.')

@csrf_exempt
def updateloanDetail(request):
    print "Inside updateloanDetail(request):"
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyData = formData["uploadData"]
            print  bodyData
            serialized_data = sscoreClient._urllib2_request('workflowEdit/updateMemberLoan', bodyData,
                                                            requestType='POST')
            print "serialized_data"
            print serialized_data
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while updateloanDetail.')

@csrf_exempt
def approveLoan(request):
    print "Inside approveLoan(request): "
    try:
        if request.method == "POST":
            formData = json.loads(request.body)
            bodyData = formData["loanData"]
            taskId = formData["taskId"]
            print  bodyData
            serialized_data = sscoreClient._urllib2_request('workflowEdit/loanValidation', bodyData,
                                                            requestType='POST')
            print "serialized_data"
            print serialized_data
            #if serialized_data["code"] == 2032 :
            #    processUpdate = { 'variables': { 'dispatchType': { 'value': "Cheque" } } }
            #    taskComplete(request,processUpdate,taskId)
            processUpdate = {'variables': {'dispatchType': {'value': "Cheque"}}}
            print "processUpdate"
            print "processUpdate"
            print json.dumps(processUpdate)
            taskComplete(request, json.dumps(processUpdate), taskId)
            return HttpResponse(json.dumps(serialized_data), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while approving loan.')


def loanAccNo(request,loanAccNumber,appGroupId,loanTypeName,groupName):
    print loanAccNumber
    print loanTypeName,appGroupId,groupName
    groups = request.user.groups.values_list('name', flat=True)
    return render_to_response("loanAccNumber.html",{"group":groups[0],"groupName": groupName,"appGroupId" :appGroupId,"loanTypeName":loanTypeName,"loanAccNo":loanAccNumber})