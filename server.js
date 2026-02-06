const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Validation middleware
function validateTask(req, res, next) {
    const { title, status } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required' });
    }

    if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be pending, in-progress, or completed' });
    }

    next();
}

// Auth Endpoints

// POST /api/signup - Register new user
app.post('/api/signup', (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, Email, and Password are required' });
    }

    // Check if email already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
            console.error('Error checking user:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        if (row) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const sql = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';

        db.run(sql, [name, email, phone, password], function (err) {
            if (err) {
                console.error('Error registering user:', err.message);
                return res.status(500).json({ error: 'Failed to register user' });
            }

            res.status(201).json({
                message: 'User registered successfully',
                user: { id: this.lastID, name, email, phone }
            });
        });
    });
});

// POST /api/login - Authenticate user
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and Password are required' });
    }

    const sql = 'SELECT id, name, email, phone, password FROM users WHERE email = ?';

    db.get(sql, [email], (err, user) => {
        if (err) {
            console.error('Error logging in:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Return user info without password
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            message: 'Login successful',
            user: userWithoutPassword
        });
    });
});

// GET /api/tasks - Get all tasks for a specific user
app.get('/api/tasks', (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const sql = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY createdAt DESC';

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching tasks:', err.message);
            return res.status(500).json({ error: 'Failed to fetch tasks' });
        }
        res.json(rows);
    });
});

// GET /api/tasks/:id - Get specific task
app.get('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const sql = 'SELECT * FROM tasks WHERE id = ? AND user_id = ?';

    db.get(sql, [id, userId], (err, row) => {
        if (err) {
            console.error('Error fetching task:', err.message);
            return res.status(500).json({ error: 'Failed to fetch task' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(row);
    });
});

// POST /api/tasks - Create new task
app.post('/api/tasks', validateTask, (req, res) => {
    const { title, description, status, userId } = req.body;
    const taskStatus = status || 'pending';

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const sql = 'INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)';

    db.run(sql, [title, description || '', taskStatus, userId], function (err) {
        if (err) {
            console.error('Error creating task:', err.message);
            return res.status(500).json({ error: 'Failed to create task' });
        }

        // Fetch the created task
        db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Task created but failed to fetch' });
            }
            res.status(201).json(row);
        });
    });
});

// PUT /api/tasks/:id - Update task
app.put('/api/tasks/:id', validateTask, (req, res) => {
    const { id } = req.params;
    const { title, description, status, userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const sql = `
        UPDATE tasks 
        SET title = ?, description = ?, status = ?, updatedAt = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ?
    `;

    db.run(sql, [title, description || '', status, id, userId], function (err) {
        if (err) {
            console.error('Error updating task:', err.message);
            return res.status(500).json({ error: 'Failed to update task' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Task not found or access denied' });
        }

        // Fetch the updated task
        db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Task updated but failed to fetch' });
            }
            res.json(row);
        });
    });
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const userId = req.query.userId; // Use query for DELETE often, or body if allowed

    // For delete, let's accept userId in body if client sends it, or query. 
    // Ideally query or header for delete. Let's look for query first, then body.
    const effectiveUserId = userId || req.body.userId;

    if (!effectiveUserId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const sql = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';

    db.run(sql, [id, effectiveUserId], function (err) {
        if (err) {
            console.error('Error deleting task:', err.message);
            return res.status(500).json({ error: 'Failed to delete task' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Task not found or access denied' });
        }

        res.json({ message: 'Task deleted successfully', id: parseInt(id) });
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api/tasks\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('\nDatabase connection closed');
        }
        process.exit(0);
    });
});
