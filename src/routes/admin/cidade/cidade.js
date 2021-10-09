const express = require('express')
const router = express.Router()
const path = require("path")
const mongoose = require("mongoose")
const { ObjectId } = require('bson')
const bcryptjs = require("bcryptjs")
const multer = require('multer')
var fs = require('fs')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/public/cidade-img/')

    },
    filename: (req, file, cb) => {
        let extArray = file.mimetype.split("/");
         let extension = extArray[extArray.length - 1];
        cb(null, req.params.fileName + '.' +extension)
    }
})
const upload = multer({ storage })


require("../../../models/Cidade")
const Cidade = mongoose.model("cidade")



//Abre a página de história
router.get('/historia', async (req,res) => {

    const historia =  await Cidade.findOne().lean()
    if(!historia){
        new Cidade ({titulo: "", mensagem: "", texto: ""}).save()
    }

    res.render('admin/cidade/historia', {
        historia: historia
    })

})

router.get('/cidade-historia', async (req,res) => {

    const cidade =  await Cidade.findOne().lean()

    res.render('institucional/cidade/historia', {
        cidade: cidade
    })
})


router.get('/imagens', async (req,res) => {

    const imagens = await Cidade.findOne().lean()
    if(!imagens){
        new Cidade ({titulo: "", mensagem: "", texto: ""}).save()
    }

    res.render('admin/cidade/imagens', {
        imagens: imagens
    })
})

router.get('/cidade-imagens', async (req,res) => {

    const cidade = await Cidade.findOne().lean()
 
    res.render('institucional/cidade/imagens', {
        cidade: cidade
    })

})

router.get('/boasvindas', async (req,res) => {

    const boasvindas = await Cidade.findOne().lean()
    if(!boasvindas){
        new Cidade ({titulo: "", mensagem: "", texto: ""}).save()
    }

    res.render('admin/locais/boasvindas', {
        boasvindas: boasvindas
    })
    
})


//Rotas de cadastro =======================================================================================================

//upload imagens 
router.post('/add-img/:fileName', upload.single('img_cidade'), (req, res) => {
    req.params.fileName

    let extArray = req.file.mimetype.split("/");
         let extension = extArray[extArray.length - 1];
         Cidade.updateOne(   
        {_id: req.body.idCidade},
        
        {$push:{imagens: [{'img': req.params.fileName + '.' + extension}]}}

        ).then(()=>{

            req.flash("success", "Imagem adicionada com sucesso")
            res.redirect("back")

        }).catch((err) => {
            req.flash("error", "Houve um erro interno")
            console.log(err)
            res.redirect("back")
        })

})

//Rotas de edição ========================================================================================================
router.post('/update-historia', (req, res) => {

    Cidade.updateOne(
        {_id: req.body.idCidade},

        {$set : {"texto": req.body.texto}}).then(()=>{

            req.flash("success", "Informações alteradas com sucesso")
            res.redirect("back")

        }).catch((err) => {
                console.log(err)
            req.flash("error", "Houve um erro interno")
            res.redirect("back")
        })

})

//Rotas de exclusão ======================================================================================================

router.post('/delete-img', (req, res) => {

    Cidade.updateOne(
        {_id: req.body.idCidade},

        {$pull:{"imagens":{"_id":req.body.idImagem}}},{multi:true}).then(()=>{

            fs.unlinkSync('./src/public/cidade-img/' + req.body.nameImagem);

            req.flash("success", "Imagem excluída com sucesso")
            res.redirect("back")

        }).catch((err) => {
                console.log(err)
            req.flash("error", "Houve um erro interno")
            res.redirect("back")
        })

})

module.exports = router;