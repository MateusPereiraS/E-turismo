require("dotenv").config();

const express = require('express')
const path = require("path")
const app = express()
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport")
const mongoose = require("mongoose");
const moment = require("moment");
const multer = require('multer')
const { ObjectId } = require('bson')
require("./config/auth")(passport)

const cors = require("cors");
const expressLayouts = require('express-ejs-layouts')

app.use((req, res, next) => { //Cria um middleware onde todas as requests passam por ele 
    if ((req.headers["x-forwarded-proto"] || "").endsWith("http")) //Checa se o protocolo informado nos headers é HTTP 
        res.redirect(`https://${req.headers.host}${req.url}`); //Redireciona pra HTTPS 
    else //Se a requisição já é HTTPS 
        next(); //Não precisa redirecionar, passa para os próximos middlewares que servirão com o conteúdo desejado 
});

app.use(
    "/files",
    express.static(path.resolve(__dirname, "..", "tmp", "uploads"))
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: "eturismo",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash());

app.use(function(req, res, next){
  res.locals.messages = req.flash();
  res.locals.user = req.user || null;
  res.locals.moment = moment;
  moment.locale('pt-br');
  next();
});


 //Pegar informações do usuário logado
 app.use(function (req, res, next) {
    if (req.user) {
    res.locals.usuarioLogado = req.user.toObject();
    app.locals.userL = req.user.toObject();
    }
    next();
});



// Mongoose===================================================================================================================
mongoose.Promise = global.Promise;
mongoose.connect("mongodb+srv://escola-inteligenteAtlas:escola-inteligenteAtlas@cluster0.47ne2.mongodb.net/eturismo?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Conectado ao mongo")
}).catch((err) => {
    console.log("Erro ao se conectar: "+err)
})


//EJS====================================================================================================================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts)  
app.set('layout', './layouts/layout')

//=======================================================================================================================

//Pasta publica==========================================================================================================
app.use(express.static(path.join(__dirname, "public")))
//=======================================================================================================================


require("./models/Locais")
const Locais = mongoose.model("locais")
require("./models/Cidade")
const Cidade = mongoose.model("cidade")
//Routes=================================================================================================================
app.get('/', async (req,res) => {

    if (req.query.nome) {
        filtroExist = true
    } else {
        filtroExist = false
    }
    req.query.nome ? nome = { nome: { $regex: req.query.nome.trim(), $options: "i" } } : nome = {}

    let locais = await Locais.aggregate([{$match: {$and: [{situacao:'liberado'}, {statusAtivo: true}, nome]}}])   
    let cidade = await Cidade.findOne().lean()
    if(!cidade){
        new Cidade ({titulo: "", mensagem: "", texto: ""}).save()
        cidade = "null"
    }

    res.render('institucional/index',{
        locais: locais,
        cidade: cidade,
        filtroExist: filtroExist,
        pesquisa: req.query.nome
    })
})

app.get('/detalhes-local/:idLocal', async (req, res) =>{

    const info = await Locais.findById({_id: req.params.idLocal}).lean()
    const cidade = await Cidade.findOne().lean()

    res.render('institucional/detalheslocal',{
        info: info,
        cidade: cidade,
        avaliacao: JSON.stringify({
            avaliacao: info.avaliacao,
            avaliacoes: info.avaliacao.avaliacoes
        }),
 
    })

})


//Rotas para login ======================================================================================================

app.get('/admin', function (req, res){
    
     if(req.user){
         res.redirect('/admin/dashboard')
    }else{
        res.render('admin/acessos/login')
    }
    
})

const adminAcessos = require("./routes/admin/acessos/acessos")
const adminDashboard = require("./routes/admin/dashboard/dashboard")
const adminLocais= require("./routes/admin/locais/locais")
const adminCidade= require("./routes/admin/cidade/cidade")


app.use('/acessos', adminAcessos)
app.use('/admin', adminDashboard)
app.use('/locais', adminLocais)
app.use('/cidade', adminCidade)


app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor rodando! ")
})