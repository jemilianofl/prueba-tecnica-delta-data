const API = '/api/v1/creditos';

document.addEventListener('DOMContentLoaded', () => {
    cargarCreditos();

    document.getElementById('formCredito').addEventListener('submit', e => {
        e.preventDefault();
        const id = document.getElementById('creditoId').value;

        const credito = {
            cliente: document.getElementById('cliente').value,
            monto: parseFloat(document.getElementById('monto').value),
            tasa_interes: parseFloat(document.getElementById('tasa_interes').value),
            plazo: parseInt(document.getElementById('plazo').value),
            fecha_otorgamiento: document.getElementById('fecha_otorgamiento').value,
        };

        if (id) {
            fetch(`${API}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credito)
            }).then(() => {
                resetForm();
                cargarCreditos();
            });
        } else {
            fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credito)
            }).then(() => {
                resetForm();
                cargarCreditos();
            });
        }
    });
});

function cargarCreditos() {
    fetch(API)
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#tablaCreditos tbody');
            tbody.innerHTML = '';
            let total = 0;

            data.forEach(c => {
                total += c.monto;
                const row = `
                    <tr>
                        <td>${c.id}</td>
                        <td>${c.cliente}</td>
                        <td>${c.monto}</td>
                        <td>${c.tasa_interes}%</td>
                        <td>${c.plazo}</td>
                        <td>${c.fecha_otorgamiento}</td>
                        <td>
                            <button onclick="editarCredito(${c.id})">Editar</button>
                            <button onclick="eliminarCredito(${c.id})">Eliminar</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });

            actualizarGrafica(data);
        });
}

function editarCredito(id) {
    fetch(`${API}`)
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
        fetch(`${API}/${id}`, { method: 'DELETE' })
            .then(() => cargarCreditos());
    }
}

function resetForm() {
    document.getElementById('formCredito').reset();
    document.getElementById('creditoId').value = '';
}

function actualizarGrafica(data) {
    const ctx = document.getElementById('graficaTotal').getContext('2d');
    const clientes = [...new Set(data.map(c => c.cliente))];
    const sumas = clientes.map(cliente =>
        data.filter(c => c.cliente === cliente).reduce((acc, c) => acc + c.monto, 0)
    );
    const colores = clientes.map(() => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`);

    if (window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: clientes,
            datasets: [{
                label: 'Créditos por Cliente',
                data: sumas,
                backgroundColor: colores
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Distribución de Créditos por Cliente'
                }
            }
        }
    });
}