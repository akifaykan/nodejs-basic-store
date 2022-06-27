// Errors Controller

exports.get404Page = (req, res)=>{
    res.status(404)
    res.render('errors/404', {title:'Not Found'})
}

exports.get500Page = (req, res)=>{
    res.status(500)
    res.render('errors/500', {title:'Beklenmeyen bir hata!'})
}