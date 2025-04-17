// db.js

// 1. Importer le driver mysql2 en version Promise
const mysql = require('mysql2/promise');

// 2. Créer un pool de connexions
//    - host     : adresse du serveur MySQL (ici en local)
//    - user     : nom d’utilisateur MySQL
//    - password : mot de passe (vide par défaut avec XAMPP)
//    - database : nom de la base que nous avons créée (task_manager)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'task_manager'
});

// 3. Exporter ce pool pour l’utiliser dans d’autres fichiers
module.exports = pool;
