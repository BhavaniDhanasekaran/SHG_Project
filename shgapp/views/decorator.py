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
                if timeDiff > django_settings.SESSION_IDLE_TIMEOUT:
                    request.session.flush()
                    return render(request, 'auth/signin.html')
            if not request.is_ajax():
                request.session['loginTime'] = current_datetime
        else:
            return HttpResponseRedirect('/signin/')    
        
        return func(request, *args, **kwargs)
    return checkLastLogin


def decryption_required(func):
    def decryptParameters(request, *args, **kwargs):
        print "\n\n\n\n\n\n\n\n"
        print args
        import base64
        print kwargs
        if args:
            for key in args:
                args[key] =  base64.b64decode(args[key])
                print "decoded key"
                print args[key]
        if kwargs:
            for key in kwargs:
                kwargs[key] =  base64.b64decode(kwargs[key])
                print "decoded key"
                print kwargs[key]
        return func(request, *args, **kwargs)
    return decryptParameters


