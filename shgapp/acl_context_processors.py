from shgapp.acl import *

def company_roles(request):
    return_dict = {}
    userroles = []
    #print 'company_roles request.user.id: ', request.user.id
    if request.user.id is not None:
        #print 'company_roles request.user.profile: ', request.user.profile
        userroles = request.user.profile.roles.values_list('name',flat=True)
        print 'company_roles roles: ', userroles
    
    # if admin is superadmin set all roles to true
    """
    if ROLE1 in userroles:
        for key, value in MAP_ROLE_ID_NAME.items():
            return_dict.update({value: True})
    else:
        for role in userroles:
            return_dict.update({MAP_ROLE_ID_NAME[role]: True})
    """
    
    for role in userroles:
            return_dict.update({MAP_ROLE_ID_NAME[role]: True})
    
    print 'company_roles return_dict: ', return_dict
    return return_dict