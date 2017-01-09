from django.http import HttpResponse
import json

class Helper(object):
    #def __init__(self):
        #print '__init__ self: ', self
    
    def bad_request(self, message):
        print 'Helper bad_request message: ', message
        response = HttpResponse(json.dumps({'message': message}), content_type='application/json')
        response.status_code = 400
        return response