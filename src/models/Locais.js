const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Locais = new Schema({
    nome: String,
    endereco: String,
    numero: String,
    bairro: String,
    cep: String,
    cidade: String,
    estado: String,
    telefone: String,
    celular: String,
    whatsapp: String,
    email: String,

    situacao: String,

    informacao: String,

    conteudoLocal:[{
        img: String,
        imgcapa: {
            type: Boolean,
            default: false
        },
    }],

    googleMaps:{
        latitude: String,
        longitude: String,
        ativo: {
            type: Boolean,
            default: false
        },
    },

    avaliacao:{
        avaliacoes:[{
            uuid: String,
            nota: Number
        }],

        avaliacaoAtiva: {
            type: Boolean,
            default: false
        }
    },
    
    notaMedia: Number,

    statusAtivo: {
        type: Boolean,
        default: true
    }

},{ timestamps: true})

mongoose.model("locais", Locais)
