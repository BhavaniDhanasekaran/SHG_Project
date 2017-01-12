from django.shortcuts import render

def dsdatecount(request):
    return render(request, 'ds-datecount.html')

def dstasklist(request):
    return render(request, 'ds-tasklist.html')

def taskunclaim(request):
    return render(request, 'ds-tasklist-unclaim.html')    

def mytask(request):
    return render(request, 'ds-mytask.html')    
