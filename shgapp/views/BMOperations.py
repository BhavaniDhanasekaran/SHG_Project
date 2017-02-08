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


def getBMTasksByTaskName(request,taskName):
    try:
        print "Entering getBMTasksByTaskName(request): view "
        username = request.user
        Grp = request.user.groups.all()
        groups = request.user.groups.values_list('name',flat=True)
        processInstancesArr = []
        processInstancesQRArr = []
        groupTaskDict 	= {}
        groupTaskData	= []

        grp_body_cont 	   = { "unassigned" : "true" , "name" : taskName }
        groupTaskList	  = camundaClient._urllib2_request('task?firstResult=0', grp_body_cont, requestType='POST')

        for data in groupTaskList:
            processInstancesArr.append(data["processInstanceId"])
            groupTaskDict[data["processInstanceId"]] = data

        bodyData = { "processInstanceIdIn": processInstancesArr }
        taskProVarList	 = camundaClient._urllib2_request('variable-instance?deserializeValues=false', bodyData, requestType='POST')
        for data in taskProVarList:
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
