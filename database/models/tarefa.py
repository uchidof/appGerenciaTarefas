from peewee import Model, CharField, DateField, DoubleField, IntegerField
from database.database import db

class Tarefa(Model):
    nome = CharField()
    custo = DoubleField()
    dtLimite = DateField()
    ordem = IntegerField()

    class Meta:
        database = db
        table_name = 'tarefa'  # Nome da tabela no banco de dados