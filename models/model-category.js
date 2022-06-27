// Category Models
const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    imgurl: String,
    description: String
})

module.exports = mongoose.model('Category', categorySchema)
