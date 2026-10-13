// para mantener mejor jerarquia de archivos y uso de SRP se crean archivos js encargados de cosas específicas

// archivo encargado de la conexion a la base de datos
const sql = require('mssql'); //se encarga de reabrir conexiones si se cierra o se cae una, no se necesita cerrar el pool manual
const config = {
  user: 'ProySTCAO',
  password: 'stcao_Proyecto',
  server: 'base-stcao.database.windows.net',
  database: 'stcao',

  // options es para evitar problemas al conectar con una base Azure
  options: {
    encrypt: true,
    trustServerCertificate: true
  },

  // pool es como tener un grupo de conexiones esperando a ser usadas
  pool: {
    max: 10, // cantidad maxima que pueden existir pa que no petatee
    min: 0,
    idleTimeoutMillis: 30000 // tiempo de vida de la conexion antes de cerrarse
  }
};

// se hace pool de conexiones para que no se tenga que abrir y cerrar la conexion cada vez que se haga una consulta
// se llama poolPromise porque es una promesa que se resuelve cuando se conecta a la base de datos
const poolPromise = new sql.ConnectionPool(config) 
  .connect()
  .then(pool => {
    console.log('Conectado a SQL Server con éxito');
    return pool;
  })
  .catch(err => {
    console.error('Error en la conexión a la base de datos: ', err);
    process.exit(1);
  });

module.exports = { //permite dividir el código en archivos para utilizar las partes afuera mediante require()
  sql,             //cada JS es un módulo aislado y las variables o funciones que contenga son privadas por defecto
  poolPromise
};




