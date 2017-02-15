from django.shortcuts import render,render_to_response
from shgapp.utils.helper import Helper
from shgapp.utils.shgexceptions import *

def dsdatecount(request):
    return render(request, 'ds-datecount.html')

def dstasklist(request):
    username = request.user
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)
    print "grp:"
    print groups[0]
    return render(request, 'ds-tasklist.html', {"group":groups[0],"user":username})

def dstasklistByName(request,taskName):
    print "taskName"
    print taskName
    username = request.user
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)
    print "grp:"
    print groups[0]
    return render(request, 'ds-tasklist.html', {"taskName":taskName,"group":groups[0],"user":username})

def taskunclaim(request):
    return render(request, 'ds-tasklist-unclaim.html')

def mytask(request):
    return render(request, 'ds-mytask.html')

def dsQueryTaskList(request):
    return render(request, 'DsMyQueryTask.html')


def bmtasklist(request):
    return render(request, 'BMTasKList.html')


def BmBAT(request):
    return render(request, 'BmBAT.html')


def BMUploadDoc(request):
    return render(request, 'BMUploadDoc.html')

def BMAddNewMember(request):
    return render(request, 'BMAddNewMember.html')

def rmtasklist(request):
    return render(request, 'RMTaskList.html')


def RmGroupApproval(request):
    return render(request, 'RmGroupApproval.html')


def CTtasklist(request):
    return render(request, 'CTTasKList.html')


def CTLoanApproval(request):
    return render(request, 'CTLoanApproval.html')


def SHGForm(request,groupId,loanId,taskId,processId,taskName,loanType):
    try:
        username = request.user
        Grp = request.user.groups.all()
        groups = request.user.groups.values_list('name',flat=True)
        templateName = {
            "KYC Check"		    				        : "ds_groupview.html"	,
            "Query Response"        				    : "queryResponseDS.html",
            "Conduct BAT- Member approval in CRM"       : "queryResponseDS.html",
            "Upload loan documents in Web application"	: "BMUploadDocs.html",
            "Resolve Data Support Team Query"			: "queryResponseDS.html",
            "Add New Members"					        : "BMAddNewMember.html",
            "Print Loan Documents & FSR"			    : "BMAddNewMember.html",
            "Approve or Reject Group"                   : "BMAddNewMember.html"
        }
        return render(request, templateName[taskName], {"loanType" :loanType, "groupId": groupId,"loanId":loanId,"processInstanceId" :processId, "taskId" : taskId,"taskName":taskName,"group":groups[0],"user":username})
    except ShgInvalidRequest, e:
        return helper.bad_request('Unexpected error occurred.')
	
	
	
	
	


      



    



    
    

          

    


