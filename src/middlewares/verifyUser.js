
module.exports = {
    verifyUser: function(req, res, next){

        if(req.user){
            return next();
        }
        res.redirect("/admin")
    }
}



