const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Usuario = new Schema({
    //Usuário
    nome: String,
    email: String,
    senha: String,

    senhaResetToken: {
        type: String,
        select: false,
    },
    senhaResetExpires: {
        type: Date,
        select: false,
    },

  
    statusAtivo: {
        type: Boolean,
        default: true
    },


},{ timestamps: true})

mongoose.model("usuarios", Usuario)
