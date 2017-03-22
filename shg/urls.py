from django.conf import settings as django_settings
from django.conf.urls.static import static
from django.conf.urls import include, url, handler400, handler403, handler404, handler500
from django.contrib import admin
from django.views.generic import TemplateView
from shgapp.views import index, task, kyc, auth,masterData, camundaViews, BMOperations, mfupload, customError,decorator
handler400 = customError.bad_request
handler403 = customError.permission_denied
handler404 = customError.page_not_found
handler500 = customError.server_error

index_urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', index.hello, name='hello'),
]
urlpatterns = index_urlpatterns

auth_urlpatterns = [
    url(r'^signup/$', auth.signup, name='signup'),
    url(r'^signin/$', auth.signin, name='signin'),
    url(r'^signout/$', auth.signout, name='signout'),
    url(r'^reset/$', auth.reset, name='reset'),
    url(r'^reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$', auth.reset_confirm, name='password_reset_confirm'),
    url(r'^success/$', auth.success, name='success'),
]

urlpatterns += auth_urlpatterns
task_urlpatterns = [
    url(r'^dsdatecount/', task.dsdatecount, name = 'dcount'),
    url(r'^dstasklist/', task.dstasklist, name = 'dstasklist'),
    url(r'^dstasklistByName/(?P<taskName>[^/]+)/(?P<loanTypeName>[^/]+)', task.dstasklistByName, name = 'dstasklistByName'),
    url(r'^mytask/', task.mytask, name = 'mytask'),
    url(r'^SHGForm/(?P<groupId>[^/]+)/(?P<loanId>[^/]+)/(?P<taskId>[^/]+)/(?P<processId>[^/]+)/(?P<taskName>[^/]+)/(?P<loanType>[^/]+)', task.SHGForm, name = 'SHGForm'),
]
urlpatterns += task_urlpatterns

kyc_urlpatterns = [
    url(r'^dsgroupview2/',kyc.dsgroupview2, name = 'dsgroupview2'),
    url(r'^dsgroupview/(?P<groupID>[^/]+)/(?P<loanID>[^/]+)/(?P<taskId>[^/]+)/(?P<processInstanceId>[^/]+)',kyc.dsgroupview, name = 'dsgroupview'),
    url(r'^groupViewQuery2/(?P<groupID>[^/]+)/(?P<loanID>[^/]+)/(?P<taskId>[^/]+)/(?P<processInstanceId>[^/]+)',kyc.groupViewQuery2, name = 'groupViewQuery2'),  
    url(r'^getGroupData/(?P<groupID>[^/]+)/(?P<taskName>[^/]+)',kyc.getGroupData, name = 'getGroupData'),
    url(r'^groupViewQuery/',kyc.groupViewQuery, name = 'groupViewQuery'),
    url(r'^getIndMemberData/(?P<memberId>[^/]+)/(?P<groupId>[^/]+)/(?P<loanId>[^/]+)/(?P<taskName>[^/]+)',kyc.getIndMemberData, name = 'getIndMemberData'),
    url(r'^getPinCodeDetails/(?P<pincode>[^/]+)',kyc.getPinCodeDetails, name = 'getPinCodeDetails'),
    url(r'^updateKYCDetails/',kyc.updateKYCDetails, name = 'updateKYCDetails'),
    url(r'^creditHistory/(?P<loanId>[^/]+)',kyc.creditHistory, name = 'creditHistory'),
    url(r'^creditHistoryGroup/(?P<loanId>[^/]+)', kyc.creditHistoryGroup, name='creditHistoryGroup'),
    url(r'^DocumentView/(?P<loanId>[^/]+)',kyc.DocumentView, name = 'DocumentView'),
    url(r'^updateMemValidationStatus/',kyc.updateMemValidationStatus, name = 'updateMemValidationStatus'),
    url(r'^updateUrl/',kyc.updateUrl, name = 'updateUrl'),  
    url(r'^loanDocument/(?P<loanTypeId>[^/]+)',kyc.loanDocument, name = 'loanDocument'),
    url(r'^editUrl/',kyc.editUrl, name = 'editUrl'),
    url(r'^getLoanDetails/(?P<groupId>[^/]+)/(?P<loanId>[^/]+)', kyc.getLoanDetails, name='getLoanDetails'),
    url(r'^dropMemberDetail/', kyc.dropMemberDetail, name='dropMemberDetail'),
    url(r'^updateloanDetail/', kyc.updateloanDetail, name='updateloanDetail'),
    url(r'^approveLoan/', kyc.approveLoan, name='approveLoan'),
    url(r'^loanAccNo/(?P<loanAccNumber>[^/]+)/(?P<appGroupId>[^/]+)/(?P<loanTypeName>[^/]+)/(?P<groupName>[^/]+)', kyc.loanAccNo, name='loanAccNo'),

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
    url(r'^KYCCheckLoanType/(?P<loanType>[^/]+)/(?P<taskName>[^/]+)',camundaViews.KYCCheckLoanType, name = 'KYCCheckLoanType'),
    url(r'^KYCTaskListByLoanType/(?P<loanTypeName>[^/]+)',camundaViews.KYCTaskListByLoanType, name = 'KYCTaskListByLoanType'),

    url(r'^unassignedTaskList/',camundaViews.unassignedTaskList, name = 'unassignedTaskList'),
    url(r'^assignedTaskList/',camundaViews.assignedTaskList, name = 'assignedTaskList'),
    url(r'^tasksCount/',camundaViews.tasksCount, name = 'tasksCount'),
    url(r'^task/(?P<id>[^/]+)/(?P<name>[^/]+)/user$', camundaViews.claim, name='claim'	),
    url(r'^KYCTasksGroupByDate/(?P<dateFrom>[^/]+)/(?P<dateTo>[^/]+)',camundaViews.KYCTasksGroupByDate, name = 'KYCTasksGroupByDate'),
    url(r'^KYCCheck/(?P<dateFrom>[^/]+)/(?P<dateTo>[^/]+)',camundaViews.KYCCheck, name = 'KYCCheck'),        
    url(r'^queryRespTaskList/(?P<loanTypeName>[^/]+)',camundaViews.queryRespTaskList, name = 'queryRespTaskList'),
    url(r'^updateTask/',camundaViews.updateTask, name = 'updateTask'),
    url(r'^taskComplete/(?P<taskId>[^/]+)',camundaViews.taskComplete, name = 'taskComplete'),
    url(r'^getHistoryComments/(?P<processId>[^/]+)',camundaViews.getHistoryComments, name = 'getHistoryComments'),
    url(r'^proposalScrutinyTaskList/',camundaViews.proposalScrutinyTaskList, name = 'proposalScrutinyTaskList'),
]
urlpatterns += camundaViews_urlpatterns

BMOperations_urlpatterns = [
    url(r'^getTasksByTaskName/(?P<taskName>[^/]+)/(?P<loanTypeName>[^/]+)',BMOperations.getTasksByTaskName, name = 'getTasksByTaskName'),
    url(r'^groupRoleDetails/',BMOperations.groupRoleDetails, name = 'groupRoleDetails'),
    url(r'^updateGrpValidationStatus/',BMOperations.updateGrpValidationStatus, name = 'updateGrpValidationStatus'),
    url(r'^updateGroupMemberStatus/',BMOperations.updateGroupMemberStatus, name = 'updateGrpValidationStatus'),
]
urlpatterns += BMOperations_urlpatterns

mfupload_urlpatterns = [    
    url(r'^ajax_progress_bar_upload/$',mfupload.ajax_progress_bar_upload, name='ajax_progress_bar_upload'),
]
urlpatterns += mfupload_urlpatterns

'''if django_settings.DEBUG:
    urlpatterns += static(django_settings.STATIC_URL, document_root=django_settings.STATIC_ROOT)
    urlpatterns += static(django_settings.MEDIA_URL, document_root=django_settings.MEDIA_ROOT)'''
