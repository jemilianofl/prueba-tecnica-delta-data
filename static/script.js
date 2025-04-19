const API_CREDITOS = '/api/v1/creditos';
const API_CLIENTES = '/api/v1/clientes';

document.addEventListener('DOMContentLoaded', () => {
    cargarCreditos();
    cargarClientes();

    document.getElementById('formCredito').addEventListener('submit', e => {
        e.preventDefault();
        const id = document.getElementById('creditoId').value;

        const credito = {
            cliente: document.getElementById('cliente').value,
            monto: parseFloat(document.getElementById('monto').value),
            tasa_interes: parseFloat(document.getElementById('tasa_interes').value),
            plazo: parseInt(document.getElementById('plazo').value),
            fecha_otorgamiento: document.getElementById('fecha_otorgamiento').value
        };

        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_CREDITOS}/${id}` : API_CREDITOS;

        fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credito)
        }).then(() => {
            resetForm();
            cargarCreditos();
        });
    });
});

function cargarClientes() {
    fetch(API_CLIENTES)
        .then(res => res.json())
        .then(data => {
            const datalist = document.getElementById('clientes');
            datalist.innerHTML = '';
            data.forEach(c => {
                const option = document.createElement('option');
                option.value = c.nombre;
                datalist.appendChild(option);
            });
        });
}

function cargarCreditos() {
    fetch(API_CREDITOS)
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#tablaCreditos tbody');
            tbody.innerHTML = '';
            const colores = {};
            const coloresUsados = [];

            data.forEach(c => {
                if (!colores[c.cliente]) {
                    const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
                    colores[c.cliente] = color;
                    coloresUsados.push(color);
                }

                const row = `
                    <tr>
                        <td>${c.id}</td>
                        <td>${c.cliente}</td>
                        <td>${c.monto}</td>
                        <td>${c.tasa_interes}%</td>
                        <td>${c.plazo}</td>
                        <td>${c.fecha_otorgamiento}</td>
                        <td>${c.estatus}</td>
                        <td>
                            <button onclick="editarCredito(${c.id})">Editar</button>
                            <button onclick="eliminarCredito(${c.id})">Eliminar</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });

            actualizarGrafica(data, colores);
        });
}

function editarCredito(id) {
    fetch(API_CREDITOS)
        .then(res => res.json())
        .then(data => {
            const c = data.find(c => c.id === id);
            document.getElementById('creditoId').value = c.id;
            document.getElementById('cliente').value = c.cliente;
            document.getElementById('monto').value = c.monto;
            document.getElementById('tasa_interes').value = c.tasa_interes;
            document.getElementById('plazo').value = c.plazo;
            document.getElementById('fecha_otorgamiento').value = c.fecha_otorgamiento;
        });
}

function eliminarCredito(id) {
    if (confirm("¿Eliminar este crédito?")) {
        fetch(`${API_CREDITOS}/${id}`, { method: 'DELETE' })
            .then(() => cargarCreditos());
    }
}

function resetForm() {
    document.getElementById('formCredito').reset();
    document.getElementById('creditoId').value = '';
}

function actualizarGrafica(data, colores) {
    const ctx = document.getElementById('graficaTotal').getContext('2d');
    // Obtener la lista única de clientes
    const clientes = [...new Set(data.map(c => c.cliente))];
    // Calcular montos para cada cliente separados por estatus
    const montosAprobados = clientes.map(cliente => 
        data.filter(c => c.cliente === cliente && c.estatus === 'Aprobado')
            .reduce((acc, c) => acc + c.monto, 0)
    );
    const montosPreaprobados = clientes.map(cliente => 
        data.filter(c => c.cliente === cliente && c.estatus === 'Preaprobado')
            .reduce((acc, c) => acc + c.monto, 0)
    );
    // Definir colores fijos para los estatus
    const colorAprobado = '#4CAF50';  // Verde para aprobados
    const colorPreaprobado = '#FFC107'; // Amarillo para preaprobados
    if (window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: clientes,
            datasets: [
                {
                    label: 'Aprobado',
                    data: montosAprobados,
                    backgroundColor: colorAprobado
                },
                {
                    label: 'Preaprobado',
                    data: montosPreaprobados,
                    backgroundColor: colorPreaprobado
                }
            ]
        },
        options: {
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Clientes'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Monto Total'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Distribución de Créditos por Cliente y Estatus'
                }
            }
        }
    });
}