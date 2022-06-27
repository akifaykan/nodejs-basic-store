// Products Controller
const Product = require('../models/model-products')
const Category = require('../models/model-category')
const Order = require('../models/model-order')

exports.getIndex = (req, res, next)=>{
    Product
        .find()
        .then(products => {
            return products
        })
        .then(products => {
            Category.find()
                .then(categories => {
                    res.render('shop/index', {
                        title: 'Home Page',
                        products: products,
                        categories: categories,
                        path: '/'
                    })
                })
        })
        .catch(err => next(err))
}

exports.getProducts = (req, res, next)=>{
    Product.find()
        .then(products => {
            return products
        })
        .then(products => {
            Category.find()
                .then(categories => {
                    res.render('shop/products', {
                        title: 'Products Page',
                        products: products,
                        categories: categories,
                        path: '/products'
                    })
                })
        })
        .catch(err => next(err))
}

exports.getProduct = (req, res, next)=>{
    Product.findById(req.params.productid)
        .then(product => {
            res.render('shop/product-detail', {
                title: product.name,
                product: product,
                path: '/product'
            })
        })
        .catch(err => next(err))
}

exports.getCategories = (req, res, next)=>{
    Category.find()
        .then(categories => {
            res.render('shop/categories', {
                title: 'Categories Page',
                categories: categories,
                path: '/categories'
            })
        })
        .catch(err => next(err))
}

exports.getProductsByCategoryId = (req, res, next)=>{
    const categoryid = req.params.categoryid
    const model = []

    Category.find()
        .then(cat => {
            model.categories = cat
            return Product.find({
                categories: categoryid
            })
        })
        .then(product => {
            res.render('shop/products', {
                title: 'Category Page',
                products: product,
                categories: model.categories,
                activecat: categoryid,
                path: '/products'
            })
        })
        .catch( err => next(error))
}

exports.getCart = (req, res, next)=>{
    req.user
        .populate('cart.items.productId')
        .exec()
        .then(user => {
            res.render('shop/cart', {
                title: 'Product Cart Page',
                path: '/cart',
                products: user.cart.items
            })
        })
        .catch(err => next(err))
}

exports.postCart = (req, res, next)=>{
    const productId = req.body.productId

    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product)
        })
        .then(()=>{
            res.redirect('/cart')
        })
        .catch(err => next(err))
}

exports.postCartItemDelete = (req, res, next)=>{
    const productid = req.body.productid

    req.user
        .deleteCartItem(productid)
        .then(() => {
            res.redirect('/cart')
        })
}

exports.getOrders = (req, res, next)=>{
    Order
        .find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                title: 'Product Orders Page',
                path: '/orders',
                orders: orders
            })
        })
        .catch(err => next(err))
}

exports.postOrder = (req, res, next)=>{
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const order = new Order({
                user: {
                    userId: req.user._id,
                    name: req.user.name,
                    email: req.user.email
                },
                items: user.cart.items.map(p =>{
                    return {
                        product: {
                            _id: p.productId._id,
                            name: p.productId.name,
                            price: p.productId.price,
                            imgurl: p.productId.imgurl
                        },
                        quantity: p.quantity
                    }
                })
            })

            return order.save()
        })
        .then(()=>{
            return req.user.clearCart()
        })
        .then(()=>{
            res.redirect('/orders')
        })
        .catch(err => next(err))
}
