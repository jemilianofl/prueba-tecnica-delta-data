from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

# Modelos
class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    creditos = db.relationship('Credito', backref='cliente', lazy=True)

class Credito(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)
    monto = db.Column(db.Float, nullable=False)
    tasa_interes = db.Column(db.Float, nullable=False)
    plazo = db.Column(db.Integer, nullable=False)
    fecha_otorgamiento = db.Column(db.String(10), nullable=False)
    estatus = db.Column(db.String(20), nullable=False, default='aprobado')

with app.app_context():
    db.create_all()

# Ruta para obtener todos los créditos
@app.route('/api/v1/creditos', methods=['GET'])
def listar_creditos():
    creditos = Credito.query.all()
    return jsonify([
        {
            'id': c.id,
            'cliente_id': c.cliente_id,
            'cliente': c.cliente.nombre,
            'monto': c.monto,
            'tasa_interes': c.tasa_interes,
            'plazo': c.plazo,
            'fecha_otorgamiento': c.fecha_otorgamiento,
            'estatus': c.estatus
        } for c in creditos
    ])

# Ruta para obtener clientes
@app.route('/api/v1/clientes', methods=['GET'])
def listar_clientes():
    clientes = Cliente.query.all()
    return jsonify([{'id': c.id, 'nombre': c.nombre} for c in clientes])

# Crear nuevo crédito (y cliente si no existe)
@app.route('/api/v1/creditos', methods=['POST'])
def crear_credito():
    data = request.json
    nombre_cliente = data['cliente']

    cliente = Cliente.query.filter_by(nombre=nombre_cliente).first()
    if not cliente:
        cliente = Cliente(nombre=nombre_cliente)
        db.session.add(cliente)
        db.session.commit()

    # Ver si ya hay un crédito activo aprobado
    tiene_aprobado = Credito.query.filter_by(cliente_id=cliente.id, estatus='aprobado').first()
    estatus = 'preaprobado' if tiene_aprobado else 'aprobado'

    nuevo = Credito(
        cliente_id=cliente.id,
        monto=data['monto'],
        tasa_interes=data['tasa_interes'],
        plazo=data['plazo'],
        fecha_otorgamiento=data['fecha_otorgamiento'],
        estatus=estatus
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({'mensaje': f'Crédito {estatus} registrado'}), 201

# Editar crédito
@app.route('/api/v1/creditos/<int:id>', methods=['PUT'])
def editar_credito(id):
    credito = Credito.query.get_or_404(id)
    data = request.get_json()

    nombre_cliente = data.get('cliente')
    if nombre_cliente:
        cliente = Cliente.query.filter_by(nombre=nombre_cliente).first()
        if not cliente:
            cliente = Cliente(nombre=nombre_cliente)
            db.session.add(cliente)
            db.session.commit()
        credito.cliente_id = cliente.id

    credito.monto = float(data.get('monto', credito.monto))
    credito.tasa_interes = float(data.get('tasa_interes', credito.tasa_interes))
    credito.plazo = int(data.get('plazo', credito.plazo))
    credito.fecha_otorgamiento = data.get('fecha_otorgamiento', credito.fecha_otorgamiento)

    db.session.commit()
    return jsonify({'mensaje': 'Crédito actualizado'})

# Eliminar crédito
@app.route('/api/v1/creditos/<int:id>', methods=['DELETE'])
def eliminar_credito(id):
    credito = Credito.query.get_or_404(id)
    cliente_id = credito.cliente_id
    db.session.delete(credito)
    db.session.commit()

    siguiente = Credito.query.filter_by(cliente_id=cliente_id, estatus='preaprobado').first()
    if siguiente:
        siguiente.estatus = 'aprobado'
        db.session.commit()

    return jsonify({'mensaje': 'Crédito eliminado y siguiente preaprobado actualizado'})

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    with app.app_context():
        db.drop_all()  # Para asegurarte que se eliminan tablas viejas
        db.create_all()  # Crea tablas nuevas con la estructura correcta
    app.run(debug=True)