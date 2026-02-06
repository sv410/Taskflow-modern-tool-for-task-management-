const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'tasks.db');

// Create and initialize database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database schema
function initializeDatabase() {
    const createTasksTableSQL = `
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL CHECK(status IN ('pending', 'in-progress', 'completed')),
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `;

    const createUsersTableSQL = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.serialize(() => {
        db.run(createUsersTableSQL, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            } else {
                console.log('Users table ready');
            }
        });

        db.run(createTasksTableSQL, (err) => {
            if (err) {
                console.error('Error creating tasks table:', err.message);
            } else {
                console.log('Tasks table ready');

                // Migration: Check if user_id exists, if not add it
                db.all("PRAGMA table_info(tasks)", (err, columns) => {
                    if (err) {
                        console.error('Error checking schema:', err);
                        return;
                    }
                    const hasUserId = columns.some(col => col.name === 'user_id');
                    if (!hasUserId) {
                        console.log('Migrating: Adding user_id to tasks table...');
                        db.run("ALTER TABLE tasks ADD COLUMN user_id INTEGER", (err) => {
                            if (err) console.error('Migration failed:', err.message);
                            else console.log('Migration successful: user_id added');
                        });
                    }
                });

                insertSampleData();
            }
        });
    });
}

// Insert sample data if table is empty
function insertSampleData() {
    db.get('SELECT COUNT(*) as count FROM tasks', (err, row) => {
        if (err) {
            console.error('Error checking data:', err.message);
            return;
        }

        if (row.count === 0) {
            const sampleTasks = [
                ['Design API endpoints', 'Create RESTful API structure', 'completed'],
                ['Implement backend logic', 'Build Express.js server with CRUD operations', 'in-progress'],
                ['Create React frontend', 'Build responsive UI components', 'pending']
            ];

            const insertSQL = 'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)';

            sampleTasks.forEach(task => {
                db.run(insertSQL, task, (err) => {
                    if (err) {
                        console.error('Error inserting sample data:', err.message);
                    }
                });
            });

            console.log('Sample data inserted');
        }
    });
}

module.exports = db;
