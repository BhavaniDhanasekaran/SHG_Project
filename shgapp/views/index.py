from django.shortcuts import render
from django.contrib.auth.decorators import login_required



@login_required
def hello(request):
    Grp = request.user.groups.all()
    groups = request.user.groups.values_list('name',flat=True)  
    print "grp:"
    print groups[0]
    return render(request, 'index.html',{"group" :groups[0] })
   


 
