const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  name: String,
  tasks: [{ title: String, notes: String }],
});

module.exports = mongoose.model('todos_list', listSchema);
