from django.conf.urls import  url, handler400, handler403, handler404, handler500
from django.contrib import admin
from shgapp.views import index, task, kyc, auth,masterData, camundaViews, BMOperations, mfupload, customError,decorator
handler400 = customError.bad_request
handler403 = customError.permission_denied
handler404 = customError.page_not_found
handler500 = customError.server_error
handler522 = customError.connection_timeout
handler503 = customError.service_unavailable


index_urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', index.hello, name='hello'),

]
urlpatterns = index_urlpatterns

customError_urlpatterns = [
    url(r'^bad_request/', customError.bad_request, name = 'bad_request'),
    url(r'^permission_denied/', customError.permission_denied, name = 'permission_denied'),
    url(r'^page_not_found/', customError.page_not_found, name = 'page_not_found'),
    url(r'^server_error/', customError.server_error, name = 'server_error'),
    url(r'^connection_timeout/', customError.connection_timeout, name = 'connection_timeout'),
    url(r'^service_unavailable/', customError.service_unavailable, name = 'service_unavailable'),
]
urlpatterns += customError_urlpatterns

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
    url(r'^dstasklistByName/(?P<taskName>[^/]+)', task.dstasklistByName, name = 'dstasklistByName'),
    url(r'^mytask/', task.mytask, name = 'mytask'),
    url(r'^SHGForm/(?P<groupId>[^/]+)/(?P<loanId>[^/]+)/(?P<taskId>[^/]+)/(?P<processId>[^/]+)/(?P<taskName>[^/]+)/(?P<loanTypeName>[^/]+)/(?P<loanTypeId>[^/]+)', task.SHGForm, name = 'SHGForm'),

]
urlpatterns += task_urlpatterns

kyc_urlpatterns = [
    url(r'^getGroupData/(?P<groupID>[^/]+)/(?P<loanId>[^/]+)/(?P<taskName>[^/]+)',kyc.getGroupData, name = 'getGroupData'),
    url(r'^getIndMemberData/(?P<memberId>[^/]+)/(?P<groupId>[^/]+)/(?P<loanId>[^/]+)/(?P<taskName>[^/]+)',kyc.getIndMemberData, name = 'getIndMemberData'),
    url(r'^getPinCodeDetails/(?P<pincode>[^/]+)',kyc.getPinCodeDetails, name = 'getPinCodeDetails'),
    url(r'^updateKYCDetails/',kyc.updateKYCDetails, name = 'updateKYCDetails'),
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
    url(r'^loanAccNo/(?P<loanAccNumber>[^/]+)/(?P<appGroupId>[^/]+)/(?P<loanTypeName>[^/]+)/(?P<groupName>[^/]+)/(?P<funder>[^/]+)/(?P<successMsg>[^/]+)', kyc.loanAccNo, name='loanAccNo'),
    url(r'^getMemberFSR/(?P<memberId>[^/]+)',kyc.getMemberFSR, name = 'getMemberFSR'),
    url(r'^getMemberComments/(?P<processId>[^/]+)/(?P<loanId>[^/]+)', kyc.getMemberComments, name='getMemberComments'),
    url(r'^getGroupComments/(?P<processId>[^/]+)/(?P<loanId>[^/]+)', kyc.getGroupComments, name='getGroupComments'),
    url(r'^getLoanMemberPaymentHistory/(?P<memberId>[^/]+)/(?P<groupId>[^/]+)',kyc.getLoanMemberPaymentHistory, name = 'getLoanMemberPaymentHistory'),
    url(r'^getLoanGroupPaymentHistory/(?P<groupId>[^/]+)',kyc.getLoanGroupPaymentHistory, name = 'getLoanGroupPaymentHistory'),
    url(r'^getATLForeClosureData/',kyc.getATLForeClosureData, name = 'getATLForeClosureData'),

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
    url(r'^taskListLoanType/(?P<taskName>[^/]+)',camundaViews.taskListLoanType, name = 'taskListLoanType'),
    url(r'^KYCTaskListByLoanType/',camundaViews.KYCTaskListByLoanType, name = 'KYCTaskListByLoanType'),

    url(r'^unassignedTaskList/',camundaViews.unassignedTaskList, name = 'unassignedTaskList'),
    url(r'^assignedTaskList/',camundaViews.assignedTaskList, name = 'assignedTaskList'),
    url(r'^tasksCount/',camundaViews.tasksCount, name = 'tasksCount'),
    url(r'^task/(?P<id>[^/]+)/(?P<name>[^/]+)/user$', camundaViews.claim, name='claim'	),
    url(r'^KYCTasksGroupByDate/(?P<dateFrom>[^/]+)/(?P<dateTo>[^/]+)',camundaViews.KYCTasksGroupByDate, name = 'KYCTasksGroupByDate'),
    url(r'^KYCCheck/(?P<dateFrom>[^/]+)/(?P<dateTo>[^/]+)',camundaViews.KYCCheck, name = 'KYCCheck'),        
    url(r'^queryRespTaskList/',camundaViews.queryRespTaskList, name = 'queryRespTaskList'),
    url(r'^updateTask/',camundaViews.updateTask, name = 'updateTask'),
    url(r'^taskComplete/(?P<taskId>[^/]+)',camundaViews.taskComplete, name = 'taskComplete'),
    url(r'^getHistoryComments/(?P<processId>[^/]+)',camundaViews.getHistoryComments, name = 'getHistoryComments'),
    url(r'^proposalScrutinyTaskList/',camundaViews.proposalScrutinyTaskList, name = 'proposalScrutinyTaskList'),
]
urlpatterns += camundaViews_urlpatterns

BMOperations_urlpatterns = [
    url(r'^getTasksByTaskName/(?P<taskName>[^/]+)',BMOperations.getTasksByTaskName, name = 'getTasksByTaskName'),
    url(r'^groupRoleDetails/',BMOperations.groupRoleDetails, name = 'groupRoleDetails'),
    url(r'^updateGrpValidationStatus/',BMOperations.updateGrpValidationStatus, name = 'updateGrpValidationStatus'),
    url(r'^updateGroupMemberStatus/',BMOperations.updateGroupMemberStatus, name = 'updateGrpValidationStatus'),
]
urlpatterns += BMOperations_urlpatterns

mfupload_urlpatterns = [    
    url(r'^ajax_progress_bar_upload/$',mfupload.ajax_progress_bar_upload, name='ajax_progress_bar_upload'),
]
urlpatterns += mfupload_urlpatterns

