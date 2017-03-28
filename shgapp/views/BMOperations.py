from django.views.decorators.csrf  import csrf_exempt
from django.http import HttpResponse
from shgapp.utils.camundaclient import CamundaClient
from shgapp.utils.sscoreclient import SSCoreClient
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *
from shgapp.views.camundaViews import taskComplete
from shgapp.views.decorator import session_required,decryption_required
import json

helper = Helper()
sscoreClient = SSCoreClient()
camundaClient = CamundaClient()

@decryption_required
@session_required
def getTasksByTaskName(request,taskName,loanTypeName):
    try:
        print "Entering getTasksByTaskName(request): view "
        username = request.session["userName"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        officeId = userOfficeData["officeId"]
        groupName = userOfficeData["designation"]
        processInstancesArr = []
        taskProVarList = []
        groupTaskDict 	= {}
        groupTaskData	= []
        grp_body_cont = {}
        if groupName == "RM":
            grp_body_cont = {"unassigned": "true", "name": taskName, "candidateGroup": str(groupName),
                             "processVariables": [{"name": "regionId", "operator": "eq", "value": officeId},
                                                  {"name": "loanTypeName", "operator": "eq", "value": loanTypeName}]}

        if groupName == "CLM" or groupName == "BM" or groupName == "CMR":
            grp_body_cont = {"unassigned": "true", "name": taskName,
                             "candidateGroup": "CLM",
                             "processVariables": [{"name": "clusterId", "operator": "eq", "value": officeId},
                                                  {"name": "loanTypeName", "operator": "eq", "value": loanTypeName}]}
        if groupName == "CreditTeam":
            grp_body_cont 	   = { "unassigned" : "true" , "name" : taskName, "candidateGroup" : str(groupName),
                                    "processVariables": [{"name": "loanTypeName", "operator": "eq","value": loanTypeName}]}

        groupTaskList	  = camundaClient._urllib2_request('task?firstResult=0', grp_body_cont, requestType='POST')
        for data in groupTaskList:
            processInstancesArr.append(data["processInstanceId"])
            groupTaskDict[data["processInstanceId"]] = data

        bodyData = {"processInstanceIdIn": processInstancesArr, "variableName" : "groupstatus"}
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
                if data["processInstanceId"] in groupTaskDict:
                    groupTaskDict[data["processInstanceId"]][data["name"] ] = data["value"]

        for key in groupTaskDict:
            groupTaskData.append(groupTaskDict[key])
        return HttpResponse(json.dumps(groupTaskData), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while getting task details.')


@csrf_exempt
@session_required
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
@session_required
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
                commentUpdate = camundaClient._urllib2_request('task/'+taskId+'/comment/create',message,requestType='POST')
            if validationResponse["code"] == 2032:
                if formData.has_key("processUpdate"):
                    bodyData = formData["processUpdate"]
                else:
                    bodyData = {}
                taskUpdateResponse = taskComplete(request,bodyData,taskId)
                return HttpResponse(json.dumps(taskUpdateResponse), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred while updating group status.')


@csrf_exempt
@session_required
def updateGroupMemberStatus(request):
    print "Inside updateGroupMemberStatus(request):"
    try:
        if request.method == "POST":
            formData  = json.loads(request.body)
            bodyGroupValidation =  formData["groupValData"]
            validationResponse = sscoreClient._urllib2_request('workflowEdit/updateMemberGroupLoan',bodyGroupValidation,requestType='POST')
            return HttpResponse(json.dumps(validationResponse), content_type="application/json")
    except ShgInvalidRequest, e:
        return helper.bad_request('An expected error occurred while update Group Member Status details.')

