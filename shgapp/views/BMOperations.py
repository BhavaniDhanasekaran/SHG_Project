from django.views.decorators import csrf
from django.views.decorators.csrf  import csrf_protect, csrf_exempt
from django.template import RequestContext
from django.shortcuts import render,render_to_response
from django.http import HttpResponseRedirect,HttpResponse,JsonResponse
from shgapp.utils.camundaclient import CamundaClient
from shgapp.utils.sscoreclient import SSCoreClient
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *
from shgapp.views.camundaViews import taskComplete
from django.contrib.auth.decorators import login_required
import json
import urllib2
import requests

helper = Helper()
sscoreClient = SSCoreClient()
camundaClient = CamundaClient()


def getTasksByTaskName(request,taskName):
    try:
        print "Entering getTasksByTaskName(request): view "
        username = request.user
        Grp = request.user.groups.all()
        groups = request.user.groups.values_list('name',flat=True)
        groupName = groups[0]
        processInstancesArr = []
        processInstancesQRArr = []
        taskProVarList = []
        taskProVarList1 = []
        groupTaskDict 	= {}
        groupTaskData	= []

        grp_body_cont 	   = { "unassigned" : "true" , "name" : taskName, "candidateGroup" : str(groupName) }
        groupTaskList	  = camundaClient._urllib2_request('task?firstResult=0', grp_body_cont, requestType='POST')
        print "groupTaskList"
        print groupTaskList
        for data in groupTaskList:
            processInstancesArr.append(data["processInstanceId"])
            groupTaskDict[data["processInstanceId"]] = data

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
                if data["processInstanceId"] in groupTaskDict:
                    groupTaskDict[data["processInstanceId"]][data["name"] ] = data["value"]

        for key in groupTaskDict:
            groupTaskData.append(groupTaskDict[key])

        return HttpResponse(json.dumps(groupTaskData), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting task details.')


@csrf_exempt
def groupRoleDetails(request):
    print "Inside groupRoleDetails(request):"
    try:
        if request.method == "POST":
            formData  = json.loads(request.body)
            bodyData =  formData["roleObj"]
            roleResponse = sscoreClient._urllib2_request('workflowDetailView/workflowGroupDetail',bodyData,requestType='POST')
            return HttpResponse(json.dumps(roleResponse), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting Credit History.')

@csrf_exempt
def updateGrpValidationStatus(request):
    print "Inside updateGrpValidationStatus(request):"
    try:
        if request.method == "POST":
            formData  = json.loads(request.body)
            bodyGroupValidation =  formData["groupValData"]
            taskId = formData["taskId"]
            validationResponse = sscoreClient._urllib2_request('workflowEdit/groupValidation',bodyGroupValidation,requestType='POST')
            if formData.has_key("message"):
                message = {"message" : formData["message"]}
                print "message"
                print message
                commentUpdate = camundaClient._urllib2_request('task/'+taskId+'/comment/create',message,requestType='POST')
                print "commentUpdate"
                print commentUpdate
            if validationResponse["message"] == "Group validation completed successfully.":
                taskUpdateResponse = taskComplete({},taskId)
                return HttpResponse(json.dumps(taskUpdateResponse), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while updating group status.')


@csrf_exempt
def updateGroupMemberStatus(request):
    print "Inside updateGroupMemberStatus(request):"
    try:
        if request.method == "POST":
            formData  = json.loads(request.body)
            bodyGroupValidation =  formData["groupValData"]
            validationResponse = sscoreClient._urllib2_request('workflowEdit/updateMemberGroupLoan',bodyGroupValidation,requestType='POST')
            print "validationResponse"
            print validationResponse
            return HttpResponse(json.dumps(validationResponse), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while update Group Memeber Status details.')