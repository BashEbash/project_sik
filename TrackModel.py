from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

#tworzymy baze danych z utworami
class TrackModel(db.Model):
    __tablename__ = 'tracks'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50))
    time = db.Column(db.String(10))
    filename = db.Column(db.String(50))

    def __init__(self, name, time, filename):
        self.name = name
        self.time = time
        self.filename = filename

    def json(self):
        return {"id": self.id, "name": self.name, "time": self.time, "filename": self.filename}