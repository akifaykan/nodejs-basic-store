// Products Controller
const Product = require('../models/model-products')
const Category = require('../models/model-category')
const fs = require('fs')

/*
 * Controller Products
======================================*/
exports.getProducts = (req, res, next)=>{
    Product
        //.find({ userId: req.user._id })
        .find()
        .populate('userId', 'name -_id')
        .populate('categories', '_id name')
        .select('name price imgurl userId description')
        .then(products => {
            res.render('admin/admin-products', {
                title: 'Admin Products List',
                products: products,
                path: '/admin/products',
                action: req.query.action
            })
        })
        .catch(err => next(err))
}

exports.getAddProduct = (req, res, next)=>{
    Category.find()
        .then(categories => {
            res.render('admin/add-product', {
                title: 'Add New Product',
                path: '/admin/add-product',
                categories: categories
            })
        })
        .catch(err => next(err))
}

exports.postAddProduct = (req, res, next)=>{
    const name = req.body.name
    const price = req.body.price
    const image = req.file
    const ids = req.body.categoryIds
    const description = req.body.description

    if(!image){
        return res.render('admin/add-product', {
            title: 'Add New Product',
            path: '/admin/add-product',
            errorMessage: 'Lütfen bir resim ekleyin',
        })
    }

    const product = new Product({
        name: name,
        price: price,
        imgurl: image.filename,
        categories: ids,
        description: description,
        userId: req.user,
        isActive: true,
        brands: ['apple']
    })
    
    product.save()
        .then(() =>{
            res.redirect('/admin/products')
        })
        .catch( err => {
            if (err.name == 'ValidationError'){
                let message = ''
                
                for(field in err.errors){
                    message += err.errors[field].message + '<br>'
                }

                Category.find()
                    .then(categories => {
                        categories = categories.map(category => {
                            if ( product.categories ) {
                                product.categories.find(item => {
                                    if ( item.toString() === category._id.toString() ){
                                        category.selected = true
                                    }
                                })
                            }

                            return category
                        })

                        res.render('admin/add-product', {
                            title: 'Add New Product',
                            path: '/admin/add-product',
                            errorMessage: message,
                            inputs: {
                                name: name,
                                price: price,
                                imgurl: image.filename,
                                categories: categories,
                                description: description
                            }
                        })
                    })
            } else {
                next(err)
            }
        })
}

exports.getEditProduct = (req, res, next)=>{
    Product.findOne({ _id: req.params.productid, userId: req.user._id })
        .then(product => {
            return product
        })
        .then(product => {
            if (!product) {
                return res.redirect('/')
            }
            Category.find()
                .then(categories => {
                    categories = categories.map(category => {
                        if ( product.categories ) {
                            product.categories.find(item => {
                                if ( item.toString() === category._id.toString() ){
                                    category.selected = true
                                }
                            })
                        }
                        
                        return category
                    })
                    
                    res.render('admin/edit-product', {
                        title: `Edit Product - ${product.name}`,
                        path: '/admin/products',
                        product: product,
                        categories: categories
                    })
                })
        })
        .catch( error => next(err))
}

exports.postEditProduct = (req, res, next)=>{
    const id = req.body.id
    const name = req.body.name
    const price = req.body.price
    const image = req.file
    const description = req.body.description
    const ids = req.body.categoryIds

    Product.findOne({ _id: id, userId: req.user._id })
        .then(product => {
            if(!product){
                return res.redirect('/')
            }

            product.name = name
            product.price = price
            product.description = description
            product.categories = ids

            if (image){
                fs.unlink('public/img/products/' + product.imgurl, err =>{
                    if (err){
                        console.log(err)
                    }
                })
                product.imgurl = image.filename
            }

            return product.save()
        })
        .then(result => {
            res.redirect('/admin/products?action=edit')
        })
        .catch(err => next(err))
}

exports.postDeleteProduct = (req, res, next) => {
    const id = req.body.productid
    
    Product.findOne({ _id: id, userId: req.user._id })
        .then(product => {
            if(!product){
                return next(new Error('Silinmek istenen ürün bulunamadı!'))
            }

            fs.unlink('public/img/products/' + product.imgurl, err =>{
                if (err){
                    console.log(err)
                }
            })
            
            return Product.deleteOne({ _id: id, userId: req.user._id })
        })
        .then(result =>{
            if (result.deletedCount === 0) {
                return next(new Error('Silinmek istenen ürün bulunamadı!'))
            }
            res.redirect('/admin/products?action=delete')
        })
        .catch( err => next(err))
}

/*
 * Controller Categories
======================================*/
exports.getCategories = (req, res, next)=>{
    Category.find()
        .then(categories => {
            res.render('admin/admin-categories', {
                title: 'Admin Categories List',
                categories: categories,
                path: '/admin/categories',
                action: req.query.action
            })
        })
        .catch(err => next(err))
}

exports.getAddCategory = (req, res, next)=>{
    res.render('admin/add-category', {
        title: 'Add New Category',
        path: '/admin/add-category'
    })
}

exports.postAddCategory = (req, res, next)=>{
    const name = req.body.name
    const imgurl = req.body.imgurl
    const description = req.body.description

    const category = new Category({
        name: name,
        imgurl: imgurl,
        description: description
    })
    
    category.save()
        .then(result =>{
            res.redirect('/admin/categories?action=create')
        })
        .catch( err => next(err))
}

exports.getEditCategory = (req, res, next)=>{
    Category.findById(req.params.categoryid)
        .then(category => {
            res.render('admin/edit-category', {
                title: `Edit Category - ${category.name}`,
                path: '/admin/categories',
                category: category
            })
        })
        .catch( err => next(err))
}

exports.postEditCategory = (req, res, next)=>{
    const id = req.body.id
    const name = req.body.name
    const imgurl = req.body.imgurl
    const description = req.body.description

    Category.findById(id)
        .then(category => {
            category.name = name
            category.imgurl = imgurl
            category.description = description
            
            return category.save()
        })
        .then(() => {
            res.redirect('/admin/categories?action=edit')
        })
        .catch(err => next(err))
}

exports.postDeleteCategory = (req, res, next)=>{
    const id = req.body.categoryid

    Category.findByIdAndRemove(id)
        .then(()=>{
            res.redirect('/admin/categories?action=delete')
        })
        .catch( err => next(err))
}