from routes.home import home_route
from routes.tarefas import tarefas_route
from database.database import db
from database.models.tarefa import Tarefa

def configure_all(app):
    configure_routes(app)
    configure_db()


def configure_routes(app):
    app.register_blueprint(home_route)
    app.register_blueprint(tarefas_route, url_prefix='/tarefas')

def configure_db():
    try:
        db.connect()
        db.create_tables([Tarefa])
    finally:
     db.close()