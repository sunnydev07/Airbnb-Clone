const mongoose = require('mongoose');

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

module.exports = { isDatabaseConnected };
