from django.shortcuts import render

# Create your views here.

# custom error views
def bad_request(request):
    return render(request, 'error/400.html')

def permission_denied(request):
    return render(request, 'error/403.html')

def page_not_found(request):
    return render(request, 'error/404.html')

def server_error(request):
    return render(request, 'error/500.html')
