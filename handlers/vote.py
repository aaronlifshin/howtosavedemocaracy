import json
from authhandler import AuthHandler
from models.point import Point

class Vote(AuthHandler):
    def post(self):
        resultJSON = json.dumps({'result': False})
        point, pointRoot = Point.getCurrentByUrl(self.request.get('pointURL'))
        user = self.current_user
        if point and user:
            if user.addVote(point, int(self.request.get('vote'))):
                resultJSON = json.dumps({'result': True, 'newVote': self.request.get('vote')})
        self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
        self.response.out.write(resultJSON)
