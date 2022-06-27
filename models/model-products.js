// Products Models
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ürün adı giriniz'],
        minlength: [5, 'Ürün adı için min 5 karakter girmelisiniz'],
        maxlength: [255, 'Ürün adı için max 255 karakter girmelisiniz'],
        trim: true
    },
    price: {
        type: Number,
        required: function(){
            return this.isActive
        },
        min: 0,
        max: 10000,
        trim: true,
        get: value => Math.round(value),
        set: value => Math.round(value)
    },
    description: {
        type: String,
        minlenght: 10
    },
    imgurl: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    /*brands: {
        type: Array,
        validate: {
            validator: function(value){
                return value && value.length > 0
            },
            message: 'Bu ürün için bir marka giriniz'
        }  
    },
    isActive: Boolean,*/
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }]
})

module.exports = mongoose.model('Product', productSchema)
