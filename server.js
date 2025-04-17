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


app.get('/tasks', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tasks');
        res.json(rows);               // 200 OK implicite
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Exemple pour GET /tasks/:id
app.get('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);

    if (rows.length === 0) {
        // Aucune tâche correspondant à l'id
        return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    res.json(rows[0]);
});

// Exemple pour DELETE /tasks/:id
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        // Aucun enregistrement supprimé
        return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    res.sendStatus(204);
});


// Exemple pour POST /tasks
app.post('/tasks', async (req, res) => {
    const { title, description } = req.body;

    // Validation basique du payload
    if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Le champ "title" est requis et doit être une chaîne non vide.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO tasks (title, description) VALUES (?, ?)',
            [title, description || null]
        );
        res.status(201).json({
            id: result.insertId,
            title,
            description: description || null,
            status: 'todo'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Exemple pour PUT /tasks/:id
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;

    // Validation basique du payload
    const validStatuses = ['todo', 'in_progress', 'done'];
    if (
        typeof title !== 'string' || title.trim() === '' ||
        (description !== undefined && typeof description !== 'string') ||
        (status !== undefined && !validStatuses.includes(status))
    ) {
        return res.status(400).json({
            error:
                'Payload invalide : ' +
                '"title" non vide requis, ' +
                '"description" facultatif de type string, ' +
                '"status" facultatif parmi ' + validStatuses.join(', ')
        });
    }

    try {
        // 1. Exécuter la requête UPDATE en incluant title, description et status
        const [result] = await pool.query(
            'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?',
            [title, description ?? null, status ?? 'todo', id]
        );

        // 2. Si aucune ligne n’a été modifiée, renvoyer 404
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tâche non trouvée.' });
        }

        // 3. Récupérer la tâche mise à jour
        const [rows] = await pool.query(
            'SELECT * FROM tasks WHERE id = ?',
            [id]
        );

        // 4. Renvoyer l’objet mis à jour
        res.json(rows[0]);

    } catch (err) {
        // 5. En cas d’erreur serveur, renvoyer 500
        res.status(500).json({ error: err.message });
    }
});


// 5. Configurer un port d'écoute
const port = 3000;

// 6. Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur Express démarré sur le port ${port}`);
});
