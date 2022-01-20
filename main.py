import os

from flask import Flask, request, render_template
from flask_restful import Api, Resource, reqparse
from flask_sqlalchemy import SQLAlchemy
from marshmallow_jsonapi import flask
from werkzeug.utils import secure_filename, redirect
from mutagen.mp3 import MP3
app = Flask(__name__)
from TrackModel import db, TrackModel
app.secret_key = 'fasdryrinv4573hf63h4'
app.config['UPLOAD_FOLDER'] = "static/tracks/"

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///./tracks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

api = Api(app)
db.init_app(app)

@app.before_first_request
def create_table():
    db.create_all()

@app.after_request # blueprint can also be app~~
def after_request(response):
    header = response.headers
    header['Access-Control-Allow-Origin'] = '*'
    return response


class TracksView(Resource):

    def get(self):
        tracks = TrackModel.query.all()
        return {'tracks': list(track.json() for track in tracks)}

    def post(self):
        if request.method == "POST":
            #data = request.get_json()
            #print(data)
            #music = request.files['file']
            #print(music.filename)
            #filename = music.filename.split(".")[0]
            #file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(music.filename))
            #music.save(file_path)
            #music = MP3(music.filename)
            #time = music.info.length // 60 + ':' + music.info.length % 60
            name = request.form['exampleFormControlInput1']
            print(request.method)
            track_new = TrackModel(name, "dgdf", "sfdd")
            db.session.add(track_new)
            db.session.commit()
            return track_new.json(), 201
        else:
            return redirect("/", code=302)

class TrackView(Resource):

    def get(self, id):
        try:
            track = TrackModel.query.filter_by(id=id).first()
            return track.json()
        except:
            return {'message: track not found'}, 404



    def delete(self, id):
        track = TrackModel.query.filter_by(id=id).first()
        if track:
            db.session.delete(track)
            db.session.commit()
            return {'message: deleted'}
        else:
            return {'message': 'book not found'}, 404

api.add_resource(TracksView, '/tracks')
api.add_resource(TrackView,'/track/<int:id>')

@app.route('/player', methods=('POST', 'GET'))
def player():
    return render_template("audio.html")

@app.route('/addMusic', methods=('POST', 'GET'))
def addMusic():
    return render_template("index.html")

@app.route('/', methods=('POST', 'GET'))
def index():
    return render_template("audio.html")



if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    #app.run(port=5000)
    server = make_server('', 5000, app)
    server.serve_forever()
