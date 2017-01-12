"""shgproject URL Configuration
The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
"""
from django.conf import settings as django_settings
from django.conf.urls.static import static
from django.conf.urls import include, url, handler400, handler403, handler404, handler500
from django.contrib import admin
from django.views.generic import TemplateView
from shgapp.views import customerror, core, auth, accountprofile, samplejqdt, samplejqdt_ajax, groupmembersample,index, task, kyc, masterData, camundaViews

# custom error views
handler400 = customerror.bad_request
handler403 = customerror.permission_denied
handler404 = customerror.page_not_found
handler500 = customerror.server_error

core_urlpatterns = [
    url(r'^admin/', admin.site.urls),
    #url(r'^admin/', include(admin.site.urls)),
    
    # core views    
    url(r'^$', core.home, name='home'),
    url(r'^about/$', core.about, name='about'),
    #url(r'^about/$', TemplateView.as_view(template_name='core/about.html'), name='about'),
    url(r'^contact/$', core.contact, name='contact'),
    #url(r'^contact/$', TemplateView.as_view(template_name='core/contact.html'), name='contact')
]

urlpatterns = core_urlpatterns

auth_urlpatterns = [
    url(r'^signup/$', auth.signup, name='signup'),
    url(r'^signin/$', auth.signin, name='signin'),
    url(r'^signout/$', auth.signout, name='signout'),
    url(r'^reset/$', auth.reset, name='reset'),
    url(r'^reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$', auth.reset_confirm, name='password_reset_confirm'),
    url(r'^success/$', auth.success, name='success'),
]

urlpatterns += auth_urlpatterns

accountprofile_urlpatterns = [
    #url(r'^$', 'settings', name='settings'),
    url(r'^profile/$', accountprofile.profile, name='profile'),
    url(r'^emails/$', accountprofile.emails, name='emails'),
    url(r'^picture/$', accountprofile.picture, name='picture'),
    url(r'^password/$', accountprofile.password, name='password'),
    url(r'^upload_picture/$', accountprofile.upload_picture, name='upload_picture'),
    url(r'^save_uploaded_picture/$', accountprofile.save_uploaded_picture, name='save_uploaded_picture'),
]

urlpatterns += accountprofile_urlpatterns

samplejqdt_urlpatterns = [    
    
    # sample jquery datatable views    
    
    url(r'^datatable1/$',
        samplejqdt.datatable1, name='datatable1'),
    
    url(r'^adddata1/$',
        samplejqdt.add_data1, name='adddata1'),
    
    url(r'^editdata1/(?P<id>\d+)/$',
        samplejqdt.edit_data1, name='editdata1'),
    
    # sample jquery datatable ajax views    
    
    url(r'^ajax/datatable1list/$',
        samplejqdt_ajax.ajax_datatable1list, name='ajax_datatable1list'),
    
    url(r'^ajax/postadddata1/$',
        samplejqdt_ajax.ajax_post_add_data1, name='ajax_postadddata1'),
    
    url(r'^ajax/getdata1/(?P<id>\d+)/$',
        samplejqdt_ajax.ajax_get_data1, name='ajax_getdata1'),
    
    url(r'^ajax/puteditdata1/(?P<id>\d+)/$',
        samplejqdt_ajax.ajax_put_edit_data1, name='ajax_puteditdata1'),
]

urlpatterns += samplejqdt_urlpatterns

taskList_samplejqdt_urlpatterns = [    
    
    # sample jquery datatable views    
    url(r'^task1list/$',
        samplejqdt.task1list, name='task1list'),
    
    url(r'^task2list/$',
        samplejqdt.task2list, name='task2list'),
    
    url(r'^task3list/$',
        samplejqdt.task3list, name='task3list'),
    
    url(r'^task4list/$',
        samplejqdt.task4list, name='task4list'),
    
    # sample jquery datatable ajax views    
    url(r'^ajax/task1list/$',
        samplejqdt_ajax.ajax_task1list, name='ajax_task1list'),
    
    url(r'^ajax/task2list/$',
        samplejqdt_ajax.ajax_task2list, name='ajax_task2list'),
    
    url(r'^ajax/task3list/$',
        samplejqdt_ajax.ajax_task3list, name='ajax_task3list'),
]

urlpatterns += taskList_samplejqdt_urlpatterns

groupmembersample_urlpatterns = [    
    
    url(r'^groupmembers1/$',
        groupmembersample.group_members1, name='groupmembers1'),
    
    url(r'^ajax/postgroupmembers1/$',
        groupmembersample.ajax_post_group_members1, name='ajax_postgroupmembers1'),
    
    url(r'^ajax/postgroupmember1/$',
        groupmembersample.ajax_post_group_member1, name='ajax_postgroupmember1'),
]

urlpatterns += groupmembersample_urlpatterns


index_urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^hello/', index.hello, name = 'hello'),
]
urlpatterns = index_urlpatterns


task_urlpatterns = [
    url(r'^dsdatecount/', task.dsdatecount, name = 'dcount'),
    url(r'^dstasklist/', task.dstasklist, name = 'dstasklist'),
    url(r'^taskunclaim/',task.taskunclaim, name = 'taskunclaim'),
    url(r'^mytask/', task.mytask, name = 'mytask'),
    
]
urlpatterns += task_urlpatterns


kyc_urlpatterns = [
    url(r'^dsgroupview2/',kyc.dsgroupview2, name = 'dsgroupview2'),
    url(r'^dsgroupview/(?P<groupID>[^/]+)/(?P<loanID>[^/]+)',kyc.dsgroupview, name = 'dsgroupview'),    
    url(r'^getGroupData/(?P<groupID>[^/]+)',kyc.getGroupData, name = 'getGroupData'),
    url(r'^groupViewQuery/',kyc.groupViewQuery, name = 'groupViewQuery'),
    url(r'^getIndMemberData/(?P<memberId>[^/]+)/(?P<groupId>[^/]+)/(?P<loanId>[^/]+)',kyc.getIndMemberData, name = 'getIndMemberData'), 
    url(r'^getPinCodeDetails/(?P<pincode>[^/]+)',kyc.getPinCodeDetails, name = 'getPinCodeDetails'),
    
]
urlpatterns += kyc_urlpatterns


masterData_urlpatterns = [
    url(r'^masterDataBank/',masterData.masterDataBank, name = 'masterDataBank'),
    url(r'^masterIDProof/',masterData.masterIDProof, name = 'masterIDProof'),
    url(r'^masterAddressProof/',masterData.masterAddressProof, name = 'masterAddressProof'),
    url(r'^masterLoanPurpose/',masterData.masterLoanPurpose, name = 'masterLoanPurpose'),

]
urlpatterns += masterData_urlpatterns


camundaViews_urlpatterns = [
    url(r'^KYCTaskList/',camundaViews.KYCTaskList, name = 'KYCTaskList'),
    url(r'^unassignedTaskList/',camundaViews.unassignedTaskList, name = 'unassignedTaskList'),
    url(r'^assignedTaskList/',camundaViews.assignedTaskList, name = 'assignedTaskList'),
    url(r'^tasksCount/',camundaViews.tasksCount, name = 'tasksCount'),
    url(r'^task/(?P<id>[^/]+)/(?P<name>[^/]+)/user$', camundaViews.claim, name='claim'	),
    url(r'^KYCTasksGroupByDate/(?P<dateFrom>[^/]+)/(?P<dateTo>[^/]+)',camundaViews.KYCTasksGroupByDate, name = 'KYCTasksGroupByDate'),
    url(r'^KYCCheck/(?P<dateFrom>[^/]+)/(?P<dateTo>[^/]+)',camundaViews.KYCCheck, name = 'KYCCheck'),        
    url(r'^queryRespTaskList/',camundaViews.queryRespTaskList, name = 'queryRespTaskList'),

]
urlpatterns += camundaViews_urlpatterns









if django_settings.DEBUG:
    urlpatterns += static(django_settings.MEDIA_URL, document_root=django_settings.MEDIA_ROOT)
