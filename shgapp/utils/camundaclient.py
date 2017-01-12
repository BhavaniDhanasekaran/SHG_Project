import json
import urllib2
import requests
from shgexceptions import *
from django.conf import settings as django_settings

class CamundaClient(object):
    def __init__(self, host=django_settings.CAMUNDA_BASE_URL):
        print 'CamundaClient __init__'
        self.host = host
        print 'CamundaClient self.host', self.host
    
    def _urllib2_request(self, endpoint, params, requestType='GET'):
        try:
            response= None
            print 'CamundaClient _urllib2_request endpoint: ', endpoint
            print 'CamundaClient _urllib2_request params: ', params
            print 'CamundaClient _urllib2_request endpoint: ', endpoint
            print 'CamundaClient _urllib2_request requestType: ', requestType
            if self.host is not None:
                url = u'{0}{1}'.format(self.host, endpoint)
                print 'CamundaClient _urllib2_request url: ', url
                if requestType == 'POST':
                    print 'CamundaClient _urllib2_request POST: ', url
                    request = urllib2.Request( url, json.dumps(params), headers = { 'Content-Type' : 'application/json' } )
                    response = urllib2.urlopen(request)
                else:
                    print 'CamundaClient _urllib2_request GET: ', url
                    request = urllib2.Request( url, headers = { 'Content-Type' : 'application/json' } )
                    response = urllib2.urlopen(request)
            else:
                print 'CamundaClient _urllib2_request else: '
                raise ShgException('No Base Url.')
            return self._urllib2_parse_response(response)
        except Exception, e:        
            print 'CamundaClient _urllib2_request Exception e: ', e
            raise ShgInvalidRequest('CamundaClient _urllib2_request Exception e: ', e)    

    def _urllib2_parse_response(self, response):
        print '_urllib2_parse_response'
        print '_urllib2_parse_response getcode', response.getcode()
        if response.getcode() == 200:
            print '_urllib2_parse_response getcode 200: ', response.getcode()
            try:
                return json.loads( response.read() )
            except Exception, e:        
                print '_urllib2_parse_response Exception e: ', e
                raise ShgInvalidRequest('_urllib2_parse_response Exception e: ', e)
        elif response.getcode() == 400:
            print '_urllib2_parse_response getcode 400: ', response.getcode()
            raise ShgInvalidRequest('_urllib2_parse_response getcode: 400')
        else:
            print '_urllib2_parse_response getcode else: ', response.getcode()
            raise ShgInvalidRequest('_urllib2_parse_response getcode: ', response.getcode())

    def _request(self, endpoint, params, requestType='GET'):
        try:
            response= None
            if self.host is not None:
                url = u'{0}{1}'.format(self.host, endpoint)
                print 'CamundaClient _request url: ', url
                if requestType == 'POST':
                    print 'CamundaClient _request POST: ', url
                    response = requests.post(url, json=params)
                else:
                    print 'CamundaClient _request GET: ', url
                    response = requests.get(url, params=params)
            else:
                raise ShgException('No Base Url.')
            return self._parse_response(response)
        except Exception, e:        
            print 'CamundaClient _request Exception e: ', e
            raise ShgInvalidRequest('CamundaClient _request Exception e: ', e)

    def _parse_response(self, response):
        print '_parse_response'
        print '_parse_response status_code', response.status_code
        if response.status_code == 200:
            print '_parse_response status_code 200', response.status_code
            try:
                return response.json()
            except Exception, e:        
                print '_parse_response Exception e: ', e
                raise ShgInvalidRequest('_parse_response Exception e: ', e)
        elif response.status_code == 400:
            print '_parse_response status_code 400', response.status_code
            raise ShgInvalidRequest('_parse_response status_code: ', response.status_code)
        else:
            print '_parse_response status_code else', response.status_code
            raise ShgInvalidRequest('_parse_response status_code:', response.status_code)
