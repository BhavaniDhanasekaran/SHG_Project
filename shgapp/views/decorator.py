from django.conf import settings as django_settings
from django.shortcuts import render
import datetime
from django.http import HttpResponseRedirect

def session_required(func):
    def checkLastLogin(request, *args, **kwargs):
        if 'userName' in request.session:
            current_datetime = datetime.datetime.now()
            if 'loginTime' in request.session:
                timeDiff = (current_datetime - request.session['loginTime']).seconds
                #print "-----------------------timeDiff-----------------------"
                #print timeDiff
                if timeDiff > django_settings.SESSION_IDLE_TIMEOUT:
                    request.session.flush()
                    return render(request, 'auth/signin.html')
            if not request.is_ajax():
                request.session['loginTime'] = current_datetime
        else:
            return HttpResponseRedirect('/signin/')    
        
        return func(request, *args, **kwargs)
    return checkLastLogin


