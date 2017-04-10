from django.shortcuts import render
import json

# Create your views here.

# custom error views
def bad_request(request):
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    username = request.session["userName"]
    return render(request, 'error/400.html', {"group": groupName,"user":username})

def permission_denied(request):
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    username = request.session["userName"]
    return render(request, 'error/403.html',{"group": groupName,"user":username})

def page_not_found(request):
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    username = request.session["userName"]
    return render(request, 'error/404.html',{"group": groupName,"user":username})

def server_error(request):
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    username = request.session["userName"]
    return render(request, 'error/500.html', {"group":groupName,"user":username})

def connection_timeout(request):
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    username = request.session["userName"]
    return render(request, 'error/504.html', {"group":groupName,"user":username})


def service_unavailable(request):
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]
    username = request.session["userName"]
    return render(request, 'error/503.html', {"group":groupName,"user":username})