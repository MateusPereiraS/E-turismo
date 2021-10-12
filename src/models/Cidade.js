const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Cidade = new Schema({
//Mensagem de boas vindas
titulo: String,
mensagem: String,
   
//História da cidade
texto: String,

imagens:[{
    img: String,
}]

},{timestamps: true, unique: true})

mongoose.model("cidade", Cidade)