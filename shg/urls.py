from django.conf import settings as django_settings
from django.conf.urls.static import static
from django.conf.urls import include, url, handler400, handler403, handler404, handler500
from django.contrib import admin
from django.views.generic import TemplateView
from shgapp.views import index, task, kyc, auth,masterData, camundaViews, BMOperations

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
    url(r'^taskunclaim/',task.taskunclaim, name = 'taskunclaim'),
    url(r'^DsQueryTaskList/',task.dsQueryTaskList, name = 'DsQueryTaskList'),
    url(r'^mytask/', task.mytask, name = 'mytask'),
    url(r'^bmtasklist/', task.bmtasklist, name = 'bmtasklist'),
    url(r'^BmBAT/', task.BmBAT, name = 'BmBAT'),
    url(r'^BMUploadDoc/', task.BMUploadDoc, name = 'BMUploadDoc'),
    url(r'^BMAddNewMember/', task.BMAddNewMember, name = 'BMAddNewMember'),
    url(r'^rmtasklist/', task.rmtasklist, name = 'rmtasklist'),
    url(r'^RmGroupApproval/', task.RmGroupApproval, name = 'RmGroupApproval'),
    url(r'^CTtasklist/', task.CTtasklist, name = 'CTtasklist'),
    url(r'^CTLoanApproval/', task.CTLoanApproval, name = 'CTLoanApproval'),
]
urlpatterns += task_urlpatterns

kyc_urlpatterns = [
    url(r'^dsgroupview2/',kyc.dsgroupview2, name = 'dsgroupview2'),
    url(r'^dsgroupview/(?P<groupID>[^/]+)/(?P<loanID>[^/]+)/(?P<taskId>[^/]+)/(?P<processInstanceId>[^/]+)',kyc.dsgroupview, name = 'dsgroupview'),
    url(r'^groupViewQuery2/(?P<groupID>[^/]+)/(?P<loanID>[^/]+)/(?P<taskId>[^/]+)/(?P<processInstanceId>[^/]+)',kyc.groupViewQuery2, name = 'groupViewQuery2'),  
    url(r'^getGroupData/(?P<groupID>[^/]+)',kyc.getGroupData, name = 'getGroupData'),
    url(r'^groupViewQuery/',kyc.groupViewQuery, name = 'groupViewQuery'),
    url(r'^getIndMemberData/(?P<memberId>[^/]+)/(?P<groupId>[^/]+)/(?P<loanId>[^/]+)',kyc.getIndMemberData, name = 'getIndMemberData'), 
    url(r'^getPinCodeDetails/(?P<pincode>[^/]+)',kyc.getPinCodeDetails, name = 'getPinCodeDetails'),
    url(r'^updateKYCDetails/',kyc.updateKYCDetails, name = 'updateKYCDetails'),
    url(r'^creditHistory/(?P<groupId>[^/]+)',kyc.creditHistory, name = 'creditHistory'),
    url(r'^DocumentView/(?P<groupId>[^/]+)',kyc.DocumentView, name = 'DocumentView'),
    url(r'^validateMember/',kyc.validateMember, name = 'validateMember'),
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
    url(r'^updateTask/',camundaViews.updateTask, name = 'updateTask'),

]
urlpatterns += camundaViews_urlpatterns

BMOperations_urlpatterns = [
    url(r'^assignedBMTaskList/',BMOperations.assignedBMTaskList, name = 'assignedBMTaskList'),



]
urlpatterns += BMOperations_urlpatterns



