
# coding: utf-8

from django.core.urlresolvers import reverse
from django.contrib import messages
from django.shortcuts import render
from django.http import HttpResponseRedirect
from shgapp.utils.sscoreclient import SSCoreClient
from shgapp.utils.helper import Helper
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.contrib.auth.views import password_reset, password_reset_confirm
from shgapp.forms import SignUpForm
from django.views.decorators.csrf  import csrf_exempt
import datetime


import logging
import sys
logging.basicConfig(level=logging.INFO)
loggerInfo = logging.getLogger(__name__)

logging.basicConfig(level=logging.ERROR)
errorLog = logging.getLogger(__name__)


import json
helper = Helper()
sscoreClient = SSCoreClient()
def signup(request):
    loggerInfo.info("-------------------------Entering signup(request):--------------------------")
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if not form.is_valid():
            messages.add_message(request, messages.ERROR, 'There was some problems while creating your account. Please review some fields before submiting again.')
            return render(request, 'auth/signup.html', { 'form': form })
        else:
            username = form.cleaned_data.get('username')
            email = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password')
            User.objects.create_user(username=username, password=password, email=email)
            user = authenticate(username=username, password=password)
            login(request, user)
            messages.add_message(request, messages.SUCCESS, 'Your account were successfully created.')
            loggerInfo.info("-------------------------Exiting signup(request):--------------------------")
            return HttpResponseRedirect('/')
    else:
        loggerInfo.info("-------------------------Exiting signup(request):--------------------------")
        return render(request, 'auth/signup.html', { 'form': SignUpForm() })

@csrf_exempt
def signin(request):
    loggerInfo.info("-------------------------Entering signin(request):--------------------------")
    if 'userName' in request.session:
        loggerInfo.info("User authenticated")
        loggerInfo.info("-------------------------Exiting signin(request):--------------------------")
        return HttpResponseRedirect('/')
    else:
        loggerInfo.info("User not authenticated")
        if request.method == 'POST':
            username = request.POST['username']
            password = request.POST['password']

            if username is not None:
                bodyData = {"userName" : username, "password":password}
                loggerInfo.info("username :" +username)
                loggerInfo.info("password :" + password)

                loginResponse = sscoreClient._urllib2_request('User/logIn', bodyData,
                                                              requestType='POST')
                loggerInfo.info("loginResponse")
                loggerInfo.info(loginResponse)
                if loginResponse["code"] == 5001:
                    group = loginResponse["data"]["userOfficeDetails"]["designation"]
                    userId = loginResponse["data"]["userId"]
                    userName = loginResponse["data"]["userName"]
                    request.session["userOfficeData"] = json.dumps(loginResponse["data"]["userOfficeDetails"])
                    request.session["userName"] =  userName
                    request.session["userId"] = userId
                    request.session["userLogin"] = username
                    request.session["userActions"] = loginResponse["data"]["userActions"]
                    request.session["loginTime"] = datetime.datetime.now()
                    if 'next' in request.GET:
                        return HttpResponseRedirect(request.GET['next'])
                    else:
                        loggerInfo.info("-------------------------Exiting signin(request):--------------------------")
                        return HttpResponseRedirect('/')
                if loginResponse["code"] == 5002:
                    message = loginResponse["data"]["logInStatus"]
                    loggerInfo.info(message)
                    loggerInfo.info("-------------------------Exiting signin(request):--------------------------")
                    return render(request, 'auth/signin.html', {"Message": message})
                else:
                    return render(request, 'auth/signin.html', {"Message": "Invalid Username or Password. Try again."})
            else:
                messages.add_message(request, messages.ERROR, 'Username or password invalid.')
                return render(request, 'auth/signin.html', {"Message" : "Invalid Username or Password. Try again."})
        else:
            return render(request, 'auth/signin.html')

@csrf_exempt
def signin_old(request):
    print 'signin'
    if request.user.is_authenticated():
        print 'authenticated'
        return HttpResponseRedirect('/')
    else:
        print 'not authenticated'
        if request.method == 'POST':
            username = request.POST['username']
            password = request.POST['password']
            user = authenticate(username=username, password=password)

            if user is not None:
                if user.is_active:
                    request.session.set_expiry(request.session.get_expiry_age())
                    login(request, user)
                    if 'next' in request.GET:
                        return HttpResponseRedirect(request.GET['next'])
                    else:
                        return HttpResponseRedirect('/')
                else:
                    messages.add_message(request, messages.ERROR, 'Your account is desactivated.')
                    return render(request, 'auth/signin.html', {"Message" : "Not an Active User"})
            else:
                messages.add_message(request, messages.ERROR, 'Username or password invalid.')
                return render(request, 'auth/signin.html', {"Message" : "Invalid Username or Password. Try again."})
        else:
            return render(request, 'auth/signin.html')


def signout(request):
    request.session.flush()
    '''for key in list(request.session.keys()):
        print request.session[key]
        del request.session[key]'''
    return HttpResponseRedirect('/signin/')


def reset(request):
    return password_reset(request, template_name='auth/reset.html',
        email_template_name='auth/reset_email.html',
        subject_template_name='auth/reset_subject.txt',
        post_reset_redirect=reverse('success'))

def reset_confirm(request, uidb64=None, token=None):
    return password_reset_confirm(request, template_name='auth/reset_confirm.html',
        uidb64=uidb64, token=token, post_reset_redirect=reverse('signin'))

def success(request):
  return render(request, 'auth/success.html')

def browserError(request):
  return render(request, 'auth/browserError.html')


