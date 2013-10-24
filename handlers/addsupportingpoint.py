import json
import os
import constants
import logging
from google.appengine.ext.webapp import template

from authhandler import AuthHandler
from models.point import Point
from models.source import Source
from models.whysaurusexception import WhysaurusException

class AddSupportingPoint(AuthHandler):
    def post(self):
        jsonOutput = {'result': False}
        oldPoint, oldPointRoot = Point.getCurrentByUrl(
            self.request.get('pointUrl'))
        user = self.current_user
        linkType = self.request.get('linkType')
        nodeType = self.request.get('nodeType') if \
            self.request.get('nodeType') else 'Point'

        sourcesURLs=json.loads(self.request.get('sourcesURLs'))
        sourcesNames=json.loads(self.request.get('sourcesNames'))
        if user:
            newLinkPoint, newLinkPointRoot = Point.create(
                title=self.request.get('title'),
                nodetype=nodeType,
                content=self.request.get('content'),
                summaryText=self.request.get('plainText'),
                user=user,
                backlink=oldPoint.key.parent(),
                linktype = linkType,
                imageURL=self.request.get('imageURL'),
                imageAuthor=self.request.get('imageAuthor'),
                imageDescription=self.request.get('imageDescription'),
                sourceURLs=sourcesURLs,
                sourceNames=sourcesNames)
            try:
                logging.info('Adding newLink: ' + linkType)
                newLinks = [{'pointRoot':newLinkPointRoot,
                            'pointCurrentVersion':newLinkPoint,
                            'linkType':linkType},
                            ]
                newPoint = oldPoint.update(
                    pointsToLink=newLinks,                 
                    user=user
                )
            except WhysaurusException as e:
                jsonOutput = {
                    'result': False,
                    'err': str(e)
                }
            else:
                path = os.path.join(constants.ROOT, 'templates/pointBox.html')
                newLinkPointHTML = json.dumps(template.render(path, {'point': newLinkPoint}))
                jsonOutput = {
                    'result': True,
                    'version': newPoint.version,
                    'author': newPoint.authorName,
                    'dateEdited': newPoint.dateEdited.strftime("%Y-%m-%d %H: %M: %S %p"),
                    'numLinkPoints': newPoint.linkCount(linkType),
                    'newLinkPoint':newLinkPointHTML
                }
            resultJSON = json.dumps(jsonOutput)
            self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
            self.response.out.write(resultJSON)
        else:
            self.response.out.write('Need to be logged in')
