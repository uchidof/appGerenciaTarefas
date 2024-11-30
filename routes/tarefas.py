from flask import Blueprint, render_template, request, jsonify
from database.models.tarefa import Tarefa
from datetime import datetime

tarefas_route = Blueprint('tarefas', __name__)

@tarefas_route.route('/')   
def lista_tarefas():
    tarefas = Tarefa.select().order_by(Tarefa.ordem)
    maior_ordem = Tarefa.select().order_by(Tarefa.ordem.desc()).first().ordem if tarefas else None
    return render_template('lista_tarefas.html', tarefas = tarefas,  maior_ordem=maior_ordem)

@tarefas_route.route('/new')
def form_tarefa():
    return render_template('form_tarefa.html')

@tarefas_route.route('/', methods=['POST'])
def inserir_tarefa():
    data = request.json
    dtLimiteRecuperada = data['dtLimite']  # Captura a data enviada

    if dtLimiteRecuperada:  # Converte para o formato de data, se fornecida
        dtLimiteRecuperada = datetime.strptime(dtLimiteRecuperada, '%Y-%m-%d').date()

    # Verificar se já existe uma tarefa com o mesmo nome
    if Tarefa.select().where(Tarefa.nome == data['nome']).exists():
        return jsonify({"error": "Existe uma tarefa com esse nome."}), 400   
    # Retorna erro 400 (Bad Request)

    # Criar a nova tarefa, se o nome for único
    nova_tarefa = Tarefa.create(
        nome=data['nome'],
        custo=data['custo'],
        dtLimite=dtLimiteRecuperada,
        ordem=Tarefa.select().order_by(Tarefa.ordem.desc()).first().ordem + 1
    )

    # Retornar o HTML do item 
    if nova_tarefa:
        return render_template('item_tarefa.html', tarefa=nova_tarefa)
    else:
        tarefas = Tarefa.select().order_by(Tarefa.ordem)
        return render_template('lista_tarefas.html', tarefas = tarefas)


@tarefas_route.route('/<int:tarefa_id>/delete', methods=['DELETE'])
def deletar_tarefa(tarefa_id):
    tarefa = Tarefa.get_by_id(tarefa_id)
    tarefa.delete_instance()
    
    tarefas = Tarefa.select().order_by(Tarefa.ordem)
    return render_template('lista_tarefas.html', tarefas = tarefas)

@tarefas_route.route('/<int:tarefa_id>/edit')
def form_edit_tarefa(tarefa_id):
    tarefaE = Tarefa.get_by_id(tarefa_id)
    return render_template('form_tarefa.html', tarefa = tarefaE)

@tarefas_route.route('/<int:tarefa_id>/update', methods=['PUT'])
def atualizar_tarefa(tarefa_id):
    
    data = request.json

    tarefaEditada = Tarefa.get_by_id(tarefa_id)
    tarefaEditada.nome =  data['nome']
    tarefaEditada.custo =  data['custo']
    # Verifique se a data foi passada e, se necessário, converta para o formato adequado
    if 'dtLimite' in data:
        try:
            # Tente converter a data para o formato datetime, se necessário
            tarefaEditada.dtLimite = datetime.strptime(data['dtLimite'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Formato de data inválido."}), 400
    tarefaEditada.save()

    return render_template('item_tarefa.html', tarefa = tarefaEditada)


@tarefas_route.route('/<int:tarefa_id>')
def detalhe_tarefa(tarefa_id):
    tarefaVer = Tarefa.get_by_id(tarefa_id)
    return render_template('detalhe_tarefa.html', tarefa = tarefaVer)


@tarefas_route.route('/<int:tarefa_id>/sobe')
def subirTarefa(tarefa_id):
    limite = (
        Tarefa
        .select(Tarefa.ordem)
        .order_by(Tarefa.ordem.asc())
        .first()
    )

    tarefa_atual = Tarefa.get_by_id(tarefa_id)

    # Verifique se a tarefa atual pode subir (se não for a primeira)
    if tarefa_atual.ordem > limite.ordem:
        # Agora buscamos a tarefa com ordem imediatamente **anterior** à tarefa atual
        tarefa_anterior = (
            Tarefa
            .select()
            .where(Tarefa.ordem < tarefa_atual.ordem)  # Ordena para pegar a tarefa anterior
            .order_by(Tarefa.ordem.desc())  # Ordena de forma decrescente para pegar a tarefa anterior
            .first()  # Pegue a tarefa anterior
        )
        
        if tarefa_anterior:
            # Troca as ordens entre a tarefa atual e a anterior
            tarefa_atual.ordem, tarefa_anterior.ordem = tarefa_anterior.ordem, tarefa_atual.ordem
            tarefa_atual.save()
            tarefa_anterior.save()

    tarefas = Tarefa.select().order_by(Tarefa.ordem)
    return render_template('index.html', tarefas=tarefas)


@tarefas_route.route('/<int:tarefa_id>/desce')
def descerTarefa(tarefa_id):
    limite = (
        Tarefa
        .select(Tarefa.ordem)
        .order_by(Tarefa.ordem.desc())
        .first()
    )

    tarefa_atual= Tarefa.get_by_id(tarefa_id)
    if tarefa_atual.ordem < limite.ordem:
        tarefa_seguinte = (
            Tarefa
            .select()
            .where(Tarefa.ordem > tarefa_atual.ordem)
            .order_by(Tarefa.ordem.asc())
            .first()
        )
        tarefa_atual.ordem, tarefa_seguinte.ordem = tarefa_seguinte.ordem, tarefa_atual.ordem
        tarefa_atual.save()
        tarefa_seguinte.save()

    

    tarefas = Tarefa.select().order_by(Tarefa.ordem)
    return render_template('index.html', tarefas = tarefas)