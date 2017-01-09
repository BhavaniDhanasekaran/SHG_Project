# defining account admin roles based on the required critria.
ROLE1 = 'r1'
ROLE2 = 'r2'
ROLE3 = 'r3'
ROLE4 = 'r4'

# access permissions are mapped to human readable names.
COMPANY_ROLES = {
    ROLE1: 'Role1',
    ROLE2: 'Role2',
    ROLE3: 'Role3',
    ROLE4: 'Role4',
}

# used as variable names in context processors, explained below.
MAP_ROLE_ID_NAME = {
    ROLE1 : 'ROLE1',
    ROLE2 : 'ROLE2',
    ROLE3 : 'ROLE3',
    ROLE4 : 'ROLE4',
}

def get_company_roles(user):
    print 'get_company_roles user: ', user
    roles = []
    userroles = []
    
    if user.id is not None:
        userroles = user.profile.roles.values_list('name',flat=True)
        
    if userroles is not None:
        roles = userroles
        """
        if ROLE1 in userroles:   
            roles = COMPANY_ROLES.keys()
        else:
            roles = userroles
        """    
    print 'get_company_roles roles: ', roles
    return roles