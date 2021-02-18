export const permissions = {
    isAdmin: (req, res, next) => {
        if(req.isAuthenticated() && req.user.permissions === "admin") {
            next()
        } else {
            req.flash("error_msg", "Você precisa ser um Admin")
            res.redirect("/")
        }
    }
}