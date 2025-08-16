const knex = require('knex');
const knexfile = require('../knexfile');

// In development, we use the 'development' configuration
// In production, you might want to use a different configuration
const db = knex(knexfile.development);

module.exports = db;
