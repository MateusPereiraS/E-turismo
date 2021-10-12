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
        cb(null, './src/public/locais-img/'+ req.params.idLocal)

    },
    filename: (req, file, cb) => {
        let extArray = file.mimetype.split("/");
         let extension = extArray[extArray.length - 1];
        cb(null, req.params.fileName + '.' +extension)
    }
})
const upload = multer({ storage })



require("../../../models/Locais")
const Locais = mongoose.model("locais")
require("../../../models/Cidade")
const Cidade = mongoose.model("cidade")

router.get('/locais', async (req,res) => {

    let locais = await Locais.find().lean()

    res.render('admin/locais/locais', {
        locais: locais
    })
})

//Abre a página para adicionar o local
router.get('/add-local', async (req,res) => {

    res.render('admin/locais/add-local')
})


router.get('/boasvindas', async (req,res) => {

    const boasvindas = await Cidade.findOne().lean()
    res.render('admin/locais/boasvindas', {
        boasvindas: boasvindas
    })
})



//Rotas de cadastro =======================================================================================================


//Criação do local etapa 1
router.post('/add-local-post', async (req,res) => {

    Locais.findOne({ nome: req.body.nome }).lean().then((local) => {
        if (local) {
            req.flash("error", "Local já cadastrado.")
            res.redirect("back")
        } else {

   new Locais({nome:req.body.nome, endereco: req.body.endereco, numero: req.body.numero, bairro: req.body.bairoo, cep: req.body.cep, cidade: req.body.cidade, estado: req.body.estado,
        telefone: req.body.telefone, celular: req.body.celular, whatsapp: req.body.whatsapp, email: req.body.email,situacao: 'pendente',
         googleMaps : {'ativo' : req.body.ativarlocalizacao, 'latitude' : req.body.latitude, 'longitude': req.body.longitude} }, 
        
        ).save().then((local) => {
       
    
            fs.mkdir('./src/public/locais-img/'+local._id, (err) => {
                    if (err) {
                        res.redirect('back')
                        req.flash('error', 'Erro ao criar diretório')
                    }

                    console.log("Diretório criado! =)")              
            })
                req.flash('success', 'Local Adicionado')
                res.render('admin/locais/add-img-local', {
                local: local
            })   

        }).catch(err => {
            console.log(err)
            req.flash('error', 'Erro ao adicionar local')
            res.redirect('back')
        })
    }

    }).catch((err) => {
        req.flash("error", "Houve um erro interno")
        res.redirect("back")
    })

})

//Upload da imagem de capa etapa 2 
router.post('/upload-img/:idLocal/:fileName', upload.single('img_local'), (req, res) => {
    req.params.idLocal
    req.params.fileName

    let extArray = req.file.mimetype.split("/");
         let extension = extArray[extArray.length - 1];
    Locais.updateOne(
        {_id: req.params.idLocal},
        
        {$set:{conteudoLocal: [{'img': req.params.fileName + '.' + extension  , 'imgcapa': 'true'}],'informacao': req.body.informacao, 'situacao': 'liberado'}}

        ).then(()=>{

            req.flash("success", "Local adicionado com sucesso")
            res.redirect("/locais/edit-local/"+req.params.idLocal)

        }).catch((err) => {
            req.flash("error", "Houve um erro interno")
            res.redirect("back")
        })

})

//upload imagens 
router.post('/add-img/:idLocal/:fileName', upload.single('img_local'), (req, res) => {
    req.params.idLocal
    req.params.fileName

    let extArray = req.file.mimetype.split("/");
         let extension = extArray[extArray.length - 1];
    Locais.updateOne(
        {_id: req.params.idLocal},
        
        {$push:{conteudoLocal: [{'img': req.params.fileName + '.' + extension , 'imgcapa': false}]}}

        ).then(()=>{

            req.flash("success", "Imagem adicionada com sucesso")
            res.redirect("back")

        }).catch((err) => {
            req.flash("error", "Houve um erro interno")
            res.redirect("back")
        })

})

//Concluir cadastro de local pendente
router.post('/concluir-cadastro', async (req, res) => {

    let local = await Locais.findById({_id: req.body.idLocal}).lean()
        res.render('admin/locais/add-img-local',{
            local: local
        })

})


//Rotas de edição ========================================================================================================


router.get('/edit-local/:idLocal', async (req,res) => {

    const { idLocal } = req.params

    let locais = await Locais.findById({_id: idLocal }).lean()


    res.render('admin/locais/edit-local', {
        locais: locais
    })
})


//Atualiza capa
router.post('/update-capa', (req, res) => {

    Locais.updateOne(
        {"_id" : req.body.idLocal, "conteudoLocal.imgcapa" : true},

        {$set : {"conteudoLocal.$.imgcapa" : false}}).then(()=>{

            Locais.updateOne(
                {"_id" : req.body.idLocal, "conteudoLocal._id" : req.body.idImagem},
        
                {$set : {"conteudoLocal.$.imgcapa" : true}}).then(()=>{
             
                    req.flash("success", "Capa alterada com sucesso")
                    res.redirect("back")
        
                }).catch((err) => {
                    req.flash("error", "Houve um erro interno")
                    console.log(err)
                    res.redirect("back")
                })
        

        }).catch((err) => {
                console.log(err)
            req.flash("error", "Houve um erro interno")
            res.redirect("back")
        })

})

router.post('/update-status', (req, res) => {

    Locais.updateOne(
        {_id : req.body.idLocal,},

        {$set : {"statusAtivo" : req.body.statusLocal}}).then(()=>{

            req.flash("success", "Situação alterada com sucesso")
            res.redirect("back")

        }).catch((err) => {
                console.log(err)
            req.flash("error", "Houve um erro interno")
            res.redirect("back")
        })

})

router.post('/update-informacao', (req, res) => {

    Locais.updateOne(
        {_id : req.body.idLocal,},

        {$set : {"nome": req.body.nome,"informacao" : req.body.informacao}}).then(()=>{

            req.flash("success", "Informações alteradas com sucesso")
            res.redirect("back")

        }).catch((err) => {
                console.log(err)
            req.flash("error", "Houve um erro interno")
            res.redirect("back")
        })

})

router.post('/update-endereco', (req, res) => {

    Locais.updateOne(
        {_id : req.body.idLocal,},

        {$set : {"endereco": req.body.endereco, "numero" : req.body.numero, "bairro": req.body.bairro,
        "cep" : req.body.cep, "cidade": req.body.cidade,"estado" : req.body.estado,
        "telefone" : req.body.telefone, "celular": req.body.celular,"whatsapp" : req.body.whatsapp, "email" : req.body.email }}).then(()=>{

            req.flash("success", "Informações alteradas com sucesso")
            res.redirect("back")

        }).catch((err) => {
                console.log(err)
            req.flash("error", "Houve um erro interno")
            res.redirect("back")
        })

})

router.post('/update-localizacao-aval', (req, res) => {

    Locais.updateOne(
        {_id : req.body.idLocal,},

        {$set : {googleMaps : {'ativo' : req.body.ativarlocalizacao, 'latitude' : req.body.latitude, 'longitude': req.body.longitude} ,
          avaliacao:{'avaliacaoAtiva': req.body.ativaravaliacao}}}).then(()=>{

            req.flash("success", "Informações alteradas com sucesso")
            res.redirect("back")

        }).catch((err) => {
                console.log(err)
            req.flash("error", "Houve um erro interno")
            res.redirect("back")
        })

})


router.post('/avaliacao', (req, res) => {

    Locais.updateOne(
        {_id: req.body.idLocal},    
        {$push :{'avaliacao.avaliacoes': [{'nomelocal': req.body.nomeLocal, 'nota': req.body.nota, 'uuid': req.body.uuid, 'dataCriacao': new Date()}]}}
        

        ).then(async()=>{

    const avaliacoes = await Locais.aggregate([
        { '$match': { '_id': ObjectId(req.body.idLocal) }},
        {$unwind: '$avaliacao.avaliacoes'}, 

        { 
            '$group':{
                '_id': '$avaliacao.avaliacoes.nota',
                count: { $sum: 1 }
            }
        }
      
    ])

    var media = 0  // armazena o valor total de todas as notas
    var qtdMed = 0 // quantidade de notas que teve

    avaliacoes.forEach((v) => { // loop para pegar os valores de notas e suas quantidades
        media += v['_id'] * v['count'] // adiciono em media a quantidade de notas vezes o valor dela
        qtdMed += v['count'] // adiciona a quantidade
    })


            x = media/qtdMed
            notaMedia = Math.round(x)

            Locais.updateOne(
                {_id: req.body.idLocal},    
                {$set :{'notaMedia': notaMedia }}).then(()=>{

            req.flash("success", "Avaliação enviada")
            res.redirect("back")

        }).catch((err) => {
            console.log(err)
            req.flash("error", "Houve um erro interno")
            res.redirect("back")
        })

        }).catch((err) => {
            console.log(err)
            req.flash("error", "Houve um erro interno")
            res.redirect("back")
        })

})
router.post('/update-boasvindas', (req, res) => {

    Cidade.updateOne(
        {_id: req.body.idCidade},
        
        {$set : {'titulo' : req.body.titulo, 'mensagem' : req.body.mensagem}}).then(()=>{

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

    Locais.updateOne(
        {"_id" : req.body.idLocal},

        {$pull:{"conteudoLocal":{"_id":req.body.idImagem}}},{multi:true}).then(()=>{

            fs.unlinkSync('./src/public/locais-img/'+  req.body.idLocal + '/' + req.body.nameImagem);

            req.flash("success", "Imagem excluída com sucesso")
            res.redirect("back")

        }).catch((err) => {
                console.log(err)
            req.flash("error", "Houve um erro interno")
            res.redirect("back")
        })

})

router.post('/delete-local', (req, res) => {

    Locais.deleteOne({"_id" : req.body.idLocal}).then(()=>{

        fs.rmdirSync('./src/public/locais-img/'+  req.body.idLocal, { recursive: true })

            req.flash("success", "Local excluído com sucesso")
            res.redirect("/locais/locais")

        }).catch((err) => {
                console.log(err)
            req.flash("error", "Houve um erro interno")
            res.redirect("back")
        })

})

module.exports = router;