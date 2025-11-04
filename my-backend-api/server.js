// my-backend-api/server.js

const express = require('express');
const mysql = require('mysql');
const cors = require('cors'); // Enables Cross-Origin Resource Sharing

const app = express();
const port = 3001; // Backend port (different from React Native dev server)

// Middleware
app.use(express.json());
app.use(cors());

// --- MySQL Connection Pool ---
const pool = mysql.createPool({
    connectionLimit: 10,
    host: '204.11.58.166',
    user: 'techno_dev',
    password: 'techno@2025',
    database: 'my_react_app_db'
});

// --- API Endpoints ---

// Root
app.get('/', (req, res) => {
    res.send('Node.js API is running!');
});

// --- Project Data Endpoints ---

// Get all project data
app.get('/api/project_data', (req, res) => {
    pool.query('SELECT * FROM project_data', (error, results) => {
        if (error) {
            console.error('Error fetching project data:', error);
            return res.status(500).json({ error: 'Failed to retrieve project data.' });
        }
        res.json(results);
    });
});

// Get project data by ID
app.get('/api/project_data/:id', (req, res) => {
    const projectId = req.params.id;
    pool.query('SELECT * FROM project_data WHERE id = ?', [projectId], (error, results) => {
        if (error) {
            console.error(`Error fetching project data with ID ${projectId}:`, error);
            return res.status(500).json({ error: 'Failed to retrieve project data.' });
        }
        if (results.length === 0) return res.status(404).json({ message: 'Project data not found.' });
        res.json(results[0]);
    });
});

// Create new project data
app.post('/api/project_data', (req, res) => {
    const {
        water_available, transportation_facility, initial_investment,
        source_of_investment, working_capital_monthly, annual_turnover,
        profit_percentage, main_product_service, target_customers
    } = req.body;

    const sql = `INSERT INTO project_data (
        water_available, transportation_facility, initial_investment,
        source_of_investment, working_capital_monthly, annual_turnover,
        profit_percentage, main_product_service, target_customers
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        water_available, transportation_facility, initial_investment,
        source_of_investment, working_capital_monthly, annual_turnover,
        profit_percentage, main_product_service, target_customers
    ];

    pool.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error inserting project data:', error);
            return res.status(500).json({ error: 'Failed to add project data.' });
        }
        res.status(201).json({ message: 'Project data added successfully!', id: results.insertId });
    });
});

// --- Dynamic Endpoints for Any Table ---

// Fetch all rows from any table
app.get('/api/:table', (req, res) => {
    const table = req.params.table;
    pool.query(`SELECT * FROM ??`, [table], (err, results) => {
        if (err) {
            console.error(`Error fetching table ${table}:`, err);
            return res.status(500).json({ error: `Failed to fetch ${table}` });
        }
        res.json(results);
    });
});

// Fetch rows with a filter (e.g., member_code)
app.get('/api/:table/filter', (req, res) => {
    const { table } = req.params;
    const { field, value } = req.query; // /api/crpapp_beneficiary_enterprise/filter?field=member_code&value=123

    if (!field || !value) return res.status(400).json({ error: 'field and value query parameters are required' });

    pool.query(`SELECT * FROM ?? WHERE ?? = ?`, [table, field, value], (err, results) => {
        if (err) {
            console.error(`Error filtering ${table}:`, err);
            return res.status(500).json({ error: 'Failed to filter data' });
        }
        res.json(results);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Backend API running at http://localhost:${port}`);
    console.log(`Connected to MySQL database: ${pool.config.connectionConfig.database}`);
});
