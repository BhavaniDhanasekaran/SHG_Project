# coding: utf-8

import os
from PIL import Image
from django.core.urlresolvers import reverse as r
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseForbidden
from django.contrib import messages
from django.template import RequestContext
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, get_object_or_404, render
from django.conf import settings as django_settings
from django.contrib.auth import update_session_auth_hash
from shgapp.forms import UserEmailForm, ProfileForm, PasswordForm

@login_required
def settings(request):
    return redirect('/settings/profile/')

@login_required
def profile(request):
    if request.method == 'POST':
        form = ProfileForm(request.POST, instance=request.user.profile)
        if form.is_valid():
            form.save()
            messages.success(request, u'Your profile were successfully edited.')
            return redirect(r('profile'))
    else:
        form = ProfileForm(instance=request.user.profile)
    return render(request, 'accountprofile/profile.html', { 'form': form })

@login_required
def emails(request):
    if request.method == 'POST':
        form = UserEmailForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, u'Account Email changed successfully.')
        else:
            messages.error(request, u'Please correct the error below.')
    else:
        form = UserEmailForm(instance=request.user)
    return render(request, 'accountprofile/emails.html', { 'form' : form })

@login_required
def password(request):
    if request.method == 'POST':
        form = PasswordForm(request.user, request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, u'Password changed successfully.')
            update_session_auth_hash(request, form.user)
        else:
            messages.error(request, u'Please correct the error below.')
    else:
        form = PasswordForm(request.user)
    return render(request, 'accountprofile/password.html', { 'form' : form })


@login_required
def picture(request):
    print 'picture request: ', request
    uploaded_picture = False
    try:
        if request.GET['upload_picture'] == 'uploaded':
            uploaded_picture = True
    except Exception, e:
        uploaded_picture = False
    
    print 'picture uploaded_picture: ', uploaded_picture
    return render(request, 'accountprofile/picture.html', { 'uploaded_picture': uploaded_picture })

@login_required
def upload_picture(request):
    print 'upload_picture request: ', request
    print 'django_settings.MEDIA_ROOT: ', django_settings.MEDIA_ROOT
    print 'django_settings.MEDIA_URL: ', django_settings.MEDIA_URL
    try:
        f = request.FILES['picture']
        ext = os.path.splitext(f.name)[1].lower()
        valid_extensions = ['.gif', '.png', '.jpg', '.jpeg', '.bmp']
        if ext in valid_extensions:
            filename = django_settings.MEDIA_ROOT + '/profile_pictures/' + request.user.username + '_tmp.jpg'
            with open(filename, 'wb+') as destination:
                for chunk in f.chunks():
                    destination.write(chunk)
            im = Image.open(filename)
            width, height = im.size
            if width > 560:
                new_width = 560
                new_height = (height * 560) / width
                new_size = new_width, new_height
                im.thumbnail(new_size, Image.ANTIALIAS)
                im.save(filename)
            
            print 'upload_picture success tmp: ', filename    
            return redirect('/picture/?upload_picture=uploaded')
        else:
            print 'upload_picture else: ', ext
            messages.error(request, u'Invalid file format.')
    except Exception, e:
        print 'upload_picture e: ', e
        messages.error(request, u'An expected error occurred.')
    return redirect('/picture/')


@login_required
def save_uploaded_picture(request):
    print 'save_uploaded_picture request: ', request
    print 'django_settings.MEDIA_ROOT: ', django_settings.MEDIA_ROOT
    print 'django_settings.MEDIA_URL: ', django_settings.MEDIA_URL
    try:
        x = int(request.POST['x'])
        y = int(request.POST['y'])
        w = int(request.POST['w'])
        h = int(request.POST['h'])
        print 'save_uploaded_picture x,y,w,h: ', x ,',', y,',', w,',', h
        tmp_filename = django_settings.MEDIA_ROOT + '/profile_pictures/' + request.user.username + '_tmp.jpg'
        filename = django_settings.MEDIA_ROOT + '/profile_pictures/' + request.user.username + '.jpg'
        im = Image.open(tmp_filename)
        cropped_im = im.crop((x, y, w+x, h+y))
        cropped_im.thumbnail((200, 200), Image.ANTIALIAS)
        cropped_im.save(filename)
        os.remove(tmp_filename)
        print 'save_uploaded_picture success filename: ', filename
        return HttpResponse(django_settings.MEDIA_URL + 'profile_pictures/' + request.user.username + '.jpg')
    except Exception, e:        
        print 'save_uploaded_picture e: ', e
        messages.error(request, u'An expected error occurred.')
        return HttpResponseBadRequest()
