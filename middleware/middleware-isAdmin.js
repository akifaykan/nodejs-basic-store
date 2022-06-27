module.exports = (req, res, next) => {
    if (!req.session.isAuthenticated) {
        req.session.redirectTo = req.url
        return res.redirect('/login')
    }

    if (!req.user.isAdmin) {
        req.session.redirectTo = req.url
        return res.redirect('/')
    }
    
    next()
}