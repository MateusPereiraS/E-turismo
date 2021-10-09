const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs")
const passport = require("passport")
const mailer = require('../../../../node_modules/mailer')
const crypto = require('crypto')
require("../../../models/Usuario")
const Usuario = mongoose.model("usuarios")

router.post("/login", (req, res, next) => {
    Usuario.findOne({ email: req.body.email }).lean().then((usuario) => {
       
            passport.authenticate("local", {
                successRedirect: "/admin/dashboard",
                failureRedirect: "/admin",
                failureFlash: true
            })(req, res, next)
        
    })
})

router.get("/logout", (req, res) => {
    req.logout()
    req.flash("success_msg", "Deslogado com sucesso!")
    res.redirect("/admin")
})


router.post('/mail-senha', async (req, res) => {

    try {
        const user = await Usuario.findOne({ email: req.body.emailtroca });

        if (!user) {
            res.json({ responseid: 100 })
        } else {

            const token = crypto.randomBytes(2).toString('hex')
            const now = new Date();
            now.setHours(now.getHours() + 1)

            Usuario.updateOne({_id: user._id}, {
                '$set': {
                    senhaResetToken: token,
                    senhaResetExpires: now,
                }
            }).then(() => {

                mailer.sendMail({
                    to: req.body.emailtroca,
                    from: 'hotpedidosalterosa@gmail.com',
                    template: '/forgot_password',
                    context: { token },

                }, (err) => {
                    if (err)
                        console.log(err)

                })

                console.log(token, now)
                res.json({ responseid: 200 })
            }).catch(err => {
                registerLog.registerLog({text: "Erro na rota ACESSOS mail-senha", code: "500", description: err})
                console.log(err)
            })
        }

    } catch (err) {
        registerLog.registerLog({text: "Erro na rota ACESSOS mail-senha", code: "500", description: err})
        res.render('/404')
    }
})

router.post('/reset-senha', async (req, res) => {
    try {
        const user = await Usuario.findOne({ email: req.body.receberemail })
            .select('+senhaResetToken senhaResetExpires')
        const now = new Date();
        if (req.body.token !== user.senhaResetToken || now > user.senhaResetExpires) {
            res.json({ responseid: 100 })
        } if (req.body.senhanova == null || req.body.senhanova.length < 4) {
            res.json({ responseid: 125 })
        } else {

            res.json({ responseid: 200 })

            user.senha = req.body.senhanova
            bcryptjs.genSalt(10, (erro, salt) => {
                bcryptjs.hash(user.senha, salt, (erro, hash) => {
                    if (erro) {
                    }
                    user.senha = hash
                    user.save().then(() => {

                    }).catch((erro) => {
                        console.log(erro)
                    })
                })
            })

        }
    } catch (err) {
        console.log(err)
    }
})

router.get("/perfil", (req, res) => {
  
    res.render('admin/acessos/perfil')
})

 
router.post('/edit-perfil-cadastro', (req, res) => {

    Usuario.updateOne(
        {_id: req.body.idUsuario},
        
        {$set:{'nome': req.body.nome, 'email': req.body.email}}

        ).then(()=>{

            req.flash("success", "Dados alterados com sucesso")
            res.redirect("back")

        }).catch((err) => {
            req.flash("error", "Houve um erro interno")
            res.redirect("back")
        })

})

router.post('/trocar-senha', async (req, res) => { // rota para edicao do perfil, apenas o dados
    if(req.body.novaSenha != req.body.confirmaSenha || req.body.confirmaSenha.length < 4){

        req.flash("error", "Senhas divergentes ou muito curta")
        res.redirect("back")

    }else{
        
    Usuario.findById({ _id: req.body.idUsuario }).then(usuario => {
        usuario.senha = req.body.confirmaSenha
        bcryptjs.genSalt(10, (erro, salt) => {
            bcryptjs.hash(usuario.senha, salt, (erro, hash) => {
                if (erro) {
                    res.json(402)
                }

                usuario.senha = hash

                usuario.save().then(() => {
                    req.flash('success', 'Senha alterada com sucesso')
                    res.redirect("back")
                    
                }).catch(err => {
                    req.flash("error", "Houve um erro interno")
                    res.redirect("back")
                })
            })
        })

    })
}
})





module.exports = router;
