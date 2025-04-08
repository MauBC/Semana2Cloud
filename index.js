const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 8080;

app.use(express.json());

// Conectar a la base de datos (se crea si no existe)
const db = new sqlite3.Database('estudiantes.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Conectado a la base de datos SQLite.');
});

// Crear tabla si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS estudiantes (
        id TEXT PRIMARY KEY,
        nombre TEXT,
        apellido TEXT,
        ciclo INTEGER
    )
`);

// GET todos los estudiantes
app.get('/estudiantes', (req, res) => {
    db.all('SELECT * FROM estudiantes', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET estudiante por ID
app.get('/estudiantes/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM estudiantes WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ mensaje: "Estudiante no encontrado" });
        res.json(row);
    });
});

// POST nuevo estudiante
app.post('/estudiantes', (req, res) => {
    console.log(req.body);  // Ver qué datos recibimos
    const { id, nombre, apellido, ciclo } = req.body;
    console.log(id);  
    db.run(
        'INSERT INTO estudiantes (id, nombre, apellido, ciclo) VALUES (?, ?, ?, ?)',
        [id, nombre, apellido, ciclo],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ mensaje: "Estudiante creado", id: id });
        }
    );
});

// PUT actualizar estudiante
app.put('/estudiantes/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, apellido, ciclo } = req.body;
    db.run(
        'UPDATE estudiantes SET nombre = ?, apellido = ?, ciclo = ? WHERE id = ?',
        [nombre, apellido, ciclo, id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ mensaje: "Estudiante no encontrado" });
            res.json({ mensaje: "Estudiante actualizado" });
        }
    );
});

// DELETE estudiante
app.delete('/estudiantes/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM estudiantes WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ mensaje: "Estudiante no encontrado" });
        res.json({ mensaje: "Estudiante eliminado" });
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
