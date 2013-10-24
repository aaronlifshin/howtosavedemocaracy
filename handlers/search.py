import os
import constants
import json

from google.appengine.ext.webapp import template

from authhandler import AuthHandler
from models.point import Point

class Search(AuthHandler):
    def post(self):
        searchString = self.request.get('searchTerms')
        searchResults = Point.search(searchString, nodeType=None)
        result = len(searchResults) if searchResults else 0
        template_values = {
            'searchResults': searchResults,
            'searchString': searchString,
        }
        path = os.path.join(constants.ROOT, 'templates/searchResults.html')
        self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
        html = template.render(path, template_values)
        json_values = {'html':html,
                       'searchString': searchString,
                       'result':result
                       }
        self.response.out.write(json.dumps(json_values))
        
