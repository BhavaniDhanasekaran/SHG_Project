from __future__ import unicode_literals
from django.db import models
import os.path
#from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.db import models
from django.conf import settings as django_settings
from django.contrib.auth.models import AbstractUser

# Create your models here.

class CustomUser(AbstractUser):
    pass

class LocHierarchy(models.Model):
   name = models.CharField(max_length=100)
   class Meta:
        db_table = 'shgapp_loc_hierarchy'
   def __unicode__(self):
        return self.name    

class LocHierarchyGroup(models.Model):
   name = models.CharField(max_length=100)
   lochierarchies = models.ManyToManyField(LocHierarchy, related_name='shgapp_lochierarchygroup_lochierarchies')
   class Meta:
        db_table = 'shgapp_loc_hierarchy_group'
   def __unicode__(self):
        return self.name
    
class Role(models.Model):
   name = models.CharField(max_length=100)
   class Meta:
        db_table = 'shgapp_role'
   def __unicode__(self):
        return self.name    

class Profile(models.Model):
    user = models.OneToOneField(django_settings.AUTH_USER_MODEL)
    birth_date = models.DateField(null=True, blank=True)
    personal_email = models.EmailField(null=True, blank=True)
    address = models.CharField(max_length=150)
    url = models.CharField(max_length=150, blank=True)
    institution = models.CharField(max_length=50, blank=True)    
    #role = models.PositiveSmallIntegerField(choices=django_settings.ROLE_CHOICES, null=True, blank=True)
    roles = models.ManyToManyField(Role, related_name='shgapp_customuser_profile_roles')
    lochierarchygroups = models.ManyToManyField(LocHierarchyGroup, related_name='shgapp_customuser_profile_lochierarchygroups')

    class Meta:
        db_table = 'shgapp_customuser_profile'

    def get_url(self):
        url = self.url
        if "http://" not in self.url and "https://" not in self.url and len(self.url) > 0:
            url = "http://" + str(self.url)
        return url 

    def get_picture(self):
        no_picture = django_settings.STATIC_URL + 'images/user.png'
        try:
            filename = django_settings.MEDIA_ROOT + '/profile_pictures/' + self.user.username + '.jpg'
            picture_url = django_settings.MEDIA_URL + 'profile_pictures/' + self.user.username + '.jpg'
            if os.path.isfile(filename):
                return picture_url
            else:
                return no_picture
        except Exception, e:
            return no_picture

    def get_screen_name(self):
        try:
            if self.user.get_full_name():
                return self.user.get_full_name()
            else:
                return self.user.username
        except:
            return self.user.username

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

post_save.connect(create_user_profile, sender=django_settings.AUTH_USER_MODEL)
post_save.connect(save_user_profile, sender=django_settings.AUTH_USER_MODEL)
