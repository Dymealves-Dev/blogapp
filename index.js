import express from "express"
import handlebars from "express-handlebars"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import path from "path"
import session from "express-session"
import flash from "connect-flash"
import passport from "passport"
import nodemailer from "nodemailer"
import { admin } from "./routes/admin.js"
import { user } from "./routes/user.js"
import { posts } from "./models/posts.js"
import { categorys } from "./models/categorys.js"
import { authentication } from "./config/authentication.js"
import { mongoURI } from "./config/database.js"

authentication(passport)

const app = express()

/* Configurando Body-Parser */

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/* Configurando Express-Handlebars */

app.engine('handlebars', handlebars({ 
    defaultLayout: "main",
    runtimeOptions: { 
        allowProtoPropertiesByDefault: true, 
        allowProtoMethodsByDefault: true
    }
}))
app.set('view engine', 'handlebars')

/* Configurando Mongoose */

mongoose.Promise = global.Promise

const databaseURI = mongoURI()

await mongoose.connect(databaseURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    console.log("Conectado ao MongoDB com sucesso!")
}).catch(error => { 
    console.log(`Falha ao se conectar ao MongoDB: ${error}`)
})

/* Configurando Sessões */

app.use(session({
    secret: "cursodenode",
    resave: false,
    saveUninitialized: true,
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

/* Configurando Middlewares */

app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null

    next()
})

/* Configurando Public */

app.use(express.static(path.join("public")))

/* Configurando Rotas */

app.get("/", (req, res) => {
    posts.find().populate("category").sort({ date: "desc" }).then(posts => {
        res.render("index", {
            posts: posts
        })
    }).catch(error => {
        req.flash("error_msg", "Falha ao exibir contéudo")
        res.render("/")
    })
})

app.get("/posts/:slug", (req, res) => {
    posts.findOne({ slug: req.params.slug }).populate("category").then(posts => {
        if(posts) {
            res.render("posts/index", {
                posts: posts
            })
        } else {
            req.flash("error_msg", "Essa postagem não existe")
            res.redirect("/") 
        }
    }).catch(error => {
        req.flash("error_msg", "Falha ao exibir postagens")
        res.redirect("/")
    })
})

app.get("/categorys", (req, res) => {
    categorys.find().sort({ date: "desc" }).then(categorys => {
        res.render("categorys/index", {
            categorys: categorys
        })
    })
})

app.get("/categorys/:slug", (req, res) => {
    categorys.findOne({ slug: req.params.slug }).then(categorys => {
        if(categorys) {
            posts.find({ category: categorys._id }).sort({ date: "desc" }).then(posts => {
                res.render("categorys/posts", {
                    posts: posts,
                    categorys: categorys
                })
            }).catch(error => {
                req.flash("error_msg", "Falha ao exibir postagens")
                res.redirect("/")
            })
        } else {
            req.flash("error_msg", "Essa categoria não existe")
            res.redirect("/")
        }
    }).catch(error => {
        req.flash("error_msg", "Falha ao exibir conteúdo")
        res.redirect("/")
    })
})

app.get("/contact", (req, res) => {
    res.render("contact/index")
})

app.post("/contact", (req, res) => {
    const errors = []

    if(!req.body.fullName || typeof req.body.fullName === undefined || req.body.fullName === null) {
        errors.push({ text: "Nome inválido" })
    }

    if(!req.body.email || typeof req.body.email === undefined || req.body.email === null) {
        errors.push({ text: "Email inválido" })
    }

    if(!req.body.subject || typeof req.body.subject === undefined || req.body.subject === null) {
        errors.push({ text: "Assunto da mensagem inválido" })
    }

    if(!req.body.message || typeof req.body.message === undefined || req.body.message === null) {
        errors.push({ text: "Mensagem inválida" })
    }

    if(errors.length) {
        res.render("contact/index", {
            errors: errors,
        })
    } else {
        const user = "blogdonode@gmail.com"
        const pass = "blogdonode.js!"

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: user,
                pass: pass
            }
        })

        transporter.sendMail({
            from: `${req.body.email} <${req.body.fullName}>`,
            to: user,
            subject: `${req.body.subject}`,
            text: `${req.body.message}`,
            html: `<p style="font-size: 2.225em;">${req.body.message}</p> <br> <span style="font-size: 1.225em; font-style: italic;">Atenciosamente equipe do Blog do Node.js</span>`
        }).then(() => {
            req.flash("success_msg", "E-mail enviado com sucesso!")
            res.redirect("/")
        }).catch(error => {
            req.flash("error_msg", "Falha ao enviar email")
            res.redirect("/")
        })
    }
})

app.use("/user", user)

app.use("/admin", admin)

/* Configurando Servidor */

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Servidor On-line em http://localhost:${PORT}!`)
})