import express from "express"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import passport from "passport"
import { users } from "../models/users.js"

export const user = express.Router()

user.get("/register", (req, res) => {
    res.render("users/register", {
        page: "Cadastrar-se"
    })
})

user.post("/register", (req, res) => {
    const errors = []

    if(!req.body.fullName || typeof req.body.fullName === undefined || req.body.fullName === null) {
        errors.push({ text: "Nome inválido" })
    }

    if(!req.body.email || typeof req.body.email === undefined || req.body.email === null) {
        errors.push({ text: "Email inválido" })
    }

    if(!req.body.password || typeof req.body.password === undefined || req.body.password === null) {
        errors.push({ text: "Senha inválida" })
    }

    if(req.body.password !== req.body.passwordRepeat) {
        errors.push({ text: "Senhas não coincidem" })
    }

    if(req.body.password.length < 6) {
        errors.push({ text: "Senha muito curta" })
    }

    if(errors.length) {
        res.render("users/register", {
            errors: errors,
            page: "Cadastrar-se"
        })
    } else {
        users.findOne({ email: req.body.email }).then(user => {
            if(user) {
                req.flash("error_msg", "Uma conta já possui esse endereço de email")
                res.redirect("/user/register")
            } else {
                const newUser = new users({
                    fullName: req.body.fullName,
                    email: req.body.email,
                    password: req.body.password,
                })

                bcrypt.genSalt(10, (error, salt) => {
                    bcrypt.hash(newUser.password, salt, (error, hash) => {
                        if (error) {
                            req.flash("error_msg", "Falha ao registrar usuário")
                            res.redirect("/")
                        } else {
                            newUser.password = hash

                            newUser.save().then(() => {
                                req.flash("success_msg", "Conta criada com sucesso")
                                res.redirect("/user/login")
                            }).catch(error => {
                                req.flash("error_msg", "Falha ao criar conta")
                                res.redirect("/user/register")
                                console.log(error)
                            })
                        }
                    })
                })
            }
        }).catch(error => {
            req.flash("error_msg", "Erro interno no servidor")
            res.redirect("/user/register")
        })
    }
})

user.get("/login", (req, res) => {
    res.render("users/login", {
        page: "Entrar"
    })
})

user.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/user/login",
        failureFlash: true
    })(req, res, next) 
})

user.get("/logout", (req, res) => {
    req.logout()
    req.flash("success_msg", "Deslogado com sucesso")
    res.redirect("/")
})