from django.shortcuts import render,render_to_response
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *
from shgapp.views.decorator import session_required
import json

@session_required
def dsdatecount(request):
    return render(request, 'ds-datecount.html')

@session_required
def dstasklist(request):
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    userId = request.session["userId"]
    return render(request, 'ds-tasklist.html', {"userId":userId,"group":groupName,"user":username})

@session_required
def dstasklistByName(request,taskName,loanTypeName):
    print "taskName"
    print taskName
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    userId = request.session["userId"]
    groupName = userOfficeData["designation"]
    return render(request, 'ds-tasklist.html', {"userId":userId,"taskName":taskName,"group":groupName,"user":username,"loanTypeName":loanTypeName})

def mytask(request):
    return render(request, 'ds-mytask.html')

@session_required
def SHGForm(request,groupId,loanId,taskId,processId,taskName,loanType):
    try:
        username = request.session["userName"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        userId = request.session["userId"]
        templateName = {
            "KYC Check"		    				        : "ds_groupview.html"	,
            "Query Response"        				    : "ds_groupview.html",
            "Conduct BAT- Member approval in CRM"       : "queryResponseDS.html",
            "Upload loan documents in Web application"	: "BMUploadDocs.html",
            "Resolve Data Support Team Query"			: "queryResponseDS.html",
            "Add New Members"					        : "BMAddNewMember.html",
            "Print Loan Documents & FSR"			    : "BMAddNewMember.html",
            "Approve or Reject Group"                   : "RmGroupApproval.html",
            "Proposal scrutiny"                         : "proposalScrutiny.html",
            "BM Reply"                                  : "proposalScrutiny.html",
            "Resolve Credit Team Query"                 : "queryResponseDS.html",
            "Approve Loan"                              : "CTLoanApproval.html",
            "Prepare & print chq through BPM"           : "index.html"
        }
        return render(request, templateName[taskName], {"loanTypeName":loanType,"userId":userId,"loanType" :loanType, "groupId": groupId,"loanId":loanId,"processInstanceId" :processId, "taskId" : taskId,"taskName":taskName,"group":groupName,"user":username})
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred.')