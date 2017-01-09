from django.shortcuts import render
from django.contrib.auth.decorators import login_required

# Create your views here.

# core views

@login_required
def home(request):
    return render(request, 'core/home.html')

def about(request):
    return render(request, 'core/about.html')

def contact(request):
    return render(request, 'core/contact.html')