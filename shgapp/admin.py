from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
#from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from django.conf import settings as django_settings
from .models import ( CustomUser, Profile, Role, LocHierarchy, LocHierarchyGroup )

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'

class CustomUserAdmin(BaseUserAdmin):
    inlines = (ProfileInline, )
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_address')
    list_select_related = ('profile', )
    
    def get_address(self, instance):
        return instance.profile.address    
    get_address.short_description = 'Address'

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super(CustomUserAdmin, self).get_inline_instances(request, obj)

#admin.site.unregister(CustomUser)
# Now register the new UserAdmin...
admin.site.register(CustomUser, CustomUserAdmin)
# ... and, since we're not using Django's built-in permissions,
# unregister the Group model from admin.
admin.site.unregister(Group)

class RoleAdmin(admin.ModelAdmin):
    list_display = ('name',)

admin.site.register(Role, RoleAdmin)

class LocHierarchyAdmin(admin.ModelAdmin):
    list_display = ('name',)

admin.site.register(LocHierarchy, LocHierarchyAdmin)

class LocHierarchyGroupAdmin(admin.ModelAdmin):
    list_display = ('name',)

admin.site.register(LocHierarchyGroup, LocHierarchyGroupAdmin)
