
from django.shortcuts import render
import json

# Create your views here.

# custom error views
def bad_request(request):
    if 'userName' in request.session:
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        username = request.session["userName"]
        return render(request, 'error/400.html', {"group": groupName,"user":username})
    else:
        return render(request, 'error/400error.html')


def permission_denied(request):
    if 'userName' in request.session:
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        username = request.session["userName"]
        return render(request, 'error/403.html',{"group": groupName,"user":username})
    else:
        return render(request, 'error/403error.html')

def page_not_found(request):
    if 'userName' in request.session:
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        username = request.session["userName"]
        return render(request, 'error/404.html', {"group": groupName, "user": username})
    else:
        return render(request, 'error/404error.html')

def server_error(request):
    if 'userName' in request.session:
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        username = request.session["userName"]
        return render(request, 'error/500.html', {"group":groupName,"user":username})
    else:
        return render(request, 'error/500error.html')

def connection_timeout(request):
    if 'userName' in request.session:
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        username = request.session["userName"]
        return render(request, 'error/522.html', {"group":groupName,"user":username})
    else:
        return render(request, 'error/522error.html')


def service_unavailable(request):
    if 'userName' in request.session:
        userOfficeData = json.loads(request.session["userOfficeData"])
        groupName = userOfficeData["designation"]
        username = request.session["userName"]
        return render(request, 'error/503.html', {"group":groupName,"user":username})
    else:
        return render(request, 'error/503error.html')