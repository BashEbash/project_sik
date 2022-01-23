#dołączanie bibliotek
import os
from flask import Flask, request, render_template, url_for
from flask_restful import Api, Resource
from werkzeug.utils import secure_filename, redirect
from mutagen.mp3 import MP3
from TrackModel import db, TrackModel

#konfiguracja aplikacji Flask
app = Flask(__name__)
app.secret_key = 'fasdryrinv4573hf63h4'
app.config['UPLOAD_FOLDER'] = "./static/tracks/"
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///./tracks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#dołączanie api do aplikacji
api = Api(app)
db.init_app(app)

#utrworzenie tabeli dla api po pierwszym zapytaniu do serwera
@app.before_first_request
def create_table():
    db.create_all()

#definiowanie reakcji na zapytania get i post dla otrzymania liste muzyki i dodania muzyki
class TracksView(Resource):

    def get(self):
        #pobieramy wszystkie utwory muzyczne z bazy danych i zwracamy w postaci json
        tracks = TrackModel.query.all()
        return {'tracks': list(track.json() for track in tracks)}

    def post(self):
        #pobieramy plik z formy w html pliku
        music = request.files['upload']

        #pobieramy nazwe pliku i pobieramy plik
        filename = music.filename.split(".")[0]
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(music.filename))
        music.save(file_path)

        #pobieramy dlugosc utworu w sekundach i przekstalcujemy na minuty
        music = MP3(file_path)
        time = str(int(music.info.length // 60))  + ":" + str(int(music.info.length % 60))

        #pobieramy imie utworu z formy w html pliku
        name = request.form['name']

        #dodajemy utwor do bazy danych
        track_new = TrackModel(name, time, filename)
        db.session.add(track_new)
        db.session.commit()
        return redirect(url_for('player'), code=302)

#definiujemy enpoint do api
api.add_resource(TracksView, '/tracks')

#definiujemy enpointy aplikacji
@app.route('/player', methods=['GET'])
def player():
    return render_template("audio.html")

@app.route('/addMusic', methods=['POST', 'GET'])
def addMusic():
    return render_template("addMusic.html")

@app.route('/', methods=['GET'])
def index():
    return render_template("audio.html")

#uruchamiamy serwer
if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    server = make_server('', 5000, app)
    server.serve_forever()
