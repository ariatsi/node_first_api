// server.js

// 1. Importer Express
const express = require('express');
const db = require('./db');              // 1. Importer le pool MySQL

// 2. Créer une instance d'application
const app = express();
// ... après const app = express();
app.use(express.json());

const pool = db; // alias pool pour exécuter db.query(...)

// 3. Tester la connexion à la base de données
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('Connexion à MySQL établie avec succès');

        // 4. Exécuter une requête SELECT simple
        const [rows] = await db.query('SELECT * FROM tasks');
        console.log('Tâches présentes dans la base :', rows);

        connection.release(); // Libérer la connexion
    } catch (err) {
        console.error('Erreur de connexion à la base MySQL :', err.message);
        process.exit(1); // Arrêter l’application en cas d’erreur critique
    }
})();


// 4. Définir la route GET / de base
app.get('/', (req, res) => {
    res.send('Welcome to Task Manager API');
});

app.post('/tasks', async (req, res) => {
    try {
        const { title, description } = req.body;
        const [result] = await pool.query(
            'INSERT INTO tasks (title, description) VALUES (?, ?)',
            [title, description]
        );
        // La tâche est créée avec un id auto-incrémenté
        res.status(201).json({
            id: result.insertId,
            title,
            description,
            status: 'todo'   // valeur par défaut
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/tasks', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tasks');
        res.json(rows);               // 200 OK implicite
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;
        const [result] = await pool.query(
            'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?',
            [title, description, status, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }
        res.json({ id, title, description, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }
        res.sendStatus(204);          // No Content
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});





// 5. Configurer un port d'écoute
const port = 3000;

// 6. Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur Express démarré sur le port ${port}`);
});
