from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)  # Permite peticiones desde cualquier origen (útil para frontend)

# Modelo
class Credito(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cliente = db.Column(db.String(100), nullable=False)
    monto = db.Column(db.Float, nullable=False)
    tasa_interes = db.Column(db.Float, nullable=False)
    plazo = db.Column(db.Integer, nullable=False)
    fecha_otorgamiento = db.Column(db.String(10), nullable=False)

with app.app_context():
    db.create_all()

# Ruta para obtener todos los créditos
@app.route('/api/v1/creditos', methods=['GET'])
def listar_creditos():
    creditos = Credito.query.all()
    return jsonify([
        {
            'id': c.id,
            'cliente': c.cliente,
            'monto': c.monto,
            'tasa_interes': c.tasa_interes,
            'plazo': c.plazo,
            'fecha_otorgamiento': c.fecha_otorgamiento
        } for c in creditos
    ])

# Ruta para crear nuevo crédito
@app.route('/api/v1/creditos', methods=['POST'])
def crear_credito():
    try:
        data = request.get_json()
        campos = ['cliente', 'monto', 'tasa_interes', 'plazo', 'fecha_otorgamiento']
        if not all(c in data for c in campos):
            return jsonify({'error': 'Faltan campos obligatorios'}), 400

        nuevo = Credito(
            cliente=data['cliente'],
            monto=float(data['monto']),
            tasa_interes=float(data['tasa_interes']),
            plazo=int(data['plazo']),
            fecha_otorgamiento=data['fecha_otorgamiento']
        )
        db.session.add(nuevo)
        db.session.commit()
        return jsonify({'mensaje': 'Crédito registrado', 'id': nuevo.id}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ruta para editar crédito existente
@app.route('/api/v1/creditos/<int:id>', methods=['PUT'])
def editar_credito(id):
    try:
        credito = Credito.query.get_or_404(id)
        data = request.get_json()

        credito.cliente = data.get('cliente', credito.cliente)
        credito.monto = float(data.get('monto', credito.monto))
        credito.tasa_interes = float(data.get('tasa_interes', credito.tasa_interes))
        credito.plazo = int(data.get('plazo', credito.plazo))
        credito.fecha_otorgamiento = data.get('fecha_otorgamiento', credito.fecha_otorgamiento)

        db.session.commit()
        return jsonify({'mensaje': 'Crédito actualizado'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ruta para eliminar crédito
@app.route('/api/v1/creditos/<int:id>', methods=['DELETE'])
def eliminar_credito(id):
    try:
        credito = Credito.query.get_or_404(id)
        db.session.delete(credito)
        db.session.commit()
        return jsonify({'mensaje': 'Crédito eliminado'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)

