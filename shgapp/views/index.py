from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from shgapp.views.decorator import session_required
import json

@session_required
def hello(request):
    userId = request.session["userId"]
    userName = request.session["userName"]
    userOfficeData = json.loads(request.session["userOfficeData"])
    groupName = userOfficeData["designation"]        
    return render(request, 'index.html',{"group" : groupName, "userId" :userId,"user":userName})
   


 
