const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
const { ObjectId } = require('bson')
const bcryptjs = require("bcryptjs")
const { verifyUser } = require("../../../middlewares/verifyUser")

require("../../../models/Locais")
const Locais = mongoose.model("locais")

router.get('/dashboard', verifyUser, async (req,res) => {

    let ativos = await Locais.countDocuments({
        $and: [
          {'statusAtivo': true} , { 'situacao': 'liberado' }
        ]
    })

    let inativos = await Locais.countDocuments({
        $and: [
          {'statusAtivo': false} 
        ]
    })

    let pendentes = await Locais.countDocuments({
        $and: [
            { 'situacao': 'pendente' }
        ]
    })

    let mais_avaliados = await Locais.aggregate([
            {'$match': { 
                $and: [
                    {'statusAtivo': true , 'situacao': 'liberado' },
                ]
            }},
            {'$unwind': '$avaliacao.avaliacoes'},
            {
                $group:{
                    '_id': '$avaliacao.avaliacoes.nomelocal', 
                    count: { $sum: 1 }
                },
            }, 

            {'$unwind': '$_id'},
            {'$sort': {'count': -1}},
            {'$limit': 5}
        ])
 

    let ultimos_comentarios = await Locais.aggregate([
        {'$match': {'statusAtivo': true , 'situacao': 'liberado' }},
        {$unwind: '$avaliacao.avaliacoes'}, 

        { 
            '$group':{
                '_id': '$avaliacao.avaliacoes',
                count: { $sum: 1 }
            }
        },
        {'$unwind': '$_id'},
        {'$sort': {'_id.dataCriacao': -1}},
        {'$limit': 5}
      
    ])

    console.log(mais_avaliados)

    res.render('admin/dashboard/dashboard', {
        ativos: ativos,
        inativos: inativos,
        pendentes: pendentes,
        ultimos_comentarios: ultimos_comentarios,
        mais_avaliados: mais_avaliados
    })
})


module.exports = router;