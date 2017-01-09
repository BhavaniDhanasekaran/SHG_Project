from functools import wraps
from django.utils.decorators import available_attrs
from shgapp.acl import *
from shgapp.acl import get_company_roles
from django.http import Http404
from django.contrib.auth.decorators import login_required

def role_required(*roles):
    def decorator(f):
        @wraps(f)
        @login_required
        def _company_acl(request, *args, **kwargs):
            print 'role_required request.user:', request.user
            # Checks an admin is a superuser or admin has
            # permission to access view
            userroles = get_company_roles(request.user)
            #if ROLE1 in roles or role in roles:
            for role in roles:
                print 'role_required role:', role
                if role in userroles:
                    return f(request, *args, **kwargs)
                
            print 'role_required raise Http404'
            # if admin has no access then raise no access
            raise Http404
        return _company_acl
    return decorator