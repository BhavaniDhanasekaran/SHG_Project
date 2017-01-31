from django.shortcuts import render

def dsdatecount(request):
    return render(request, 'ds-datecount.html')

def dstasklist(request):
    return render(request, 'ds-tasklist.html')

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

    




      



    



    
    

          

    


