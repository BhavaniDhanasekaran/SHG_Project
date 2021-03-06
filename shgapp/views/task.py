from django.shortcuts import render,render_to_response
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *
from shgapp.views.decorator import session_required,decryption_required
import json

from   django.views.decorators.csrf  import csrf_exempt

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
    return render(request, 'ds-tasklist.html', {"userId":userId,"group":groupName,"user":username})

#@decryption_required
@session_required
def dstasklistByName(request,taskName):
    loggerInfo.info('------------------Entering dstasklistByName(request,taskName):---------------------- ')
    username = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    userId = request.session["userId"]
    groupName = userOfficeData["designation"]
    loggerInfo.info('------------------Exiting dstasklistByName(request,taskName):---------------------- ')
    return render(request, 'ds-tasklist.html', {"userId":userId,"taskName":taskName,"group":groupName,"user":username})

def mytask(request):
    return render(request, 'ds-mytask.html')


#@decryption_required
@csrf_exempt
@session_required
def SHGForm(request,groupId,loanId,taskId,processId,taskName,loanTypeName,loanTypeId):
    loggerInfo.info('------------------Entering SHGForm(request,groupId,loanId,taskId,processId,taskName,loanTypeName,loanTypeId):---------------------- ')
    try:
        username = request.session["userName"]
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        userId = request.session["userId"]
        templateName = {
            "KYC Check"		    				        : "ds_groupview.html",
            "Query Response"        				    : "ds_groupview.html",
            "Conduct BAT- Member approval in CRM"       : "queryResponseDS.html",
            "Upload loan documents in Web application"	: "BMUploadDocs.html",
            "Resolve Data Support Team Query"			: "queryResponseDS.html",
            "Add New Members"					        : "BMAddNewMemberRead.html",
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
        loggerInfo.info('------------------Exiting SHGForm(request,groupId,loanId,taskId,processId,taskName,loanTypeName,loanTypeId):---------------------- ')
        return render(request, templateName[taskName], {"userId":userId,"loanType" :loanTypeName,"loanTypeId":loanTypeId, "groupId": groupId,"loanId":loanId,"processInstanceId" :processId, "taskId" : taskId,"taskName":taskName,"group":groupName,"user":username})
    except ShgInvalidRequest, e:
        errorLog.error("Exception raised inside SHGForm(request,groupId,loanId,taskId,processId,taskName,loanTypeName,loanTypeId):" + e)
        return helper.bad_request('Unexpected error occurred.')

