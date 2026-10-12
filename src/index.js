const express = require('express');
const path = require('path');

// 1. Importar las rutas de la API
const loginRoutes = require('./routers/loginRoute');
const adminRoutes = require('./routers/adminRoute');
const ahorroRoutes = require('./routers/ahorroRoute');
const cargarRoutes = require('./routers/cargaRoute');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Servir archivos estáticos (CSS, JS, imágenes, etc.)
app.use(express.static(path.join(__dirname, '..', 'public')));

// 3. Rutas de Vistas (Servir los archivos HTML con rutas limpias)
/* app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login', 'login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'dashboardAdmin', 'dashboardAdmin.html'));
});

app.get('/ahorro', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'dashboardAhorro', 'dashboardAhorro.html'));
});
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'carga', 'carga.html'));
});

// 4. Rutas de la API (Endpoints de datos JSON)
/* app.use('/api/login', loginRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ahorro', ahorroRoutes); */
app.use('/api/carga', cargarRoutes);

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});