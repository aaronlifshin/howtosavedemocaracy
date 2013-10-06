import os
import json

from google.appengine.ext.webapp import template
from authhandler import AuthHandler
from models.point import Point
import constants


class AjaxSearch(AuthHandler):
    def post(self):
        resultJSON = json.dumps({'result': False})
        searchResults = Point.search(searchTerms=self.request.get('searchTerms'), 
                                     excludeURL=self.request.get('exclude'), 
                                     linkType=self.request.get('linkType') 
                                     )
        template_values = {
            'searchResults': searchResults,
            'linkType': self.request.get('linkType'),
            'thresholds': constants.SCORETHRESHOLDS
        }
        path = os.path.join(constants.ROOT, 'templates/ajaxSearchResults.html')
        resultsHTML = template.render(path, template_values)
        
        if searchResults:
            resultJSON = json.dumps({
                'result': True,
                'resultsHTML': resultsHTML,
                'searchString': self.request.get('searchTerms')
            })
        self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
        self.response.out.write(resultJSON)
