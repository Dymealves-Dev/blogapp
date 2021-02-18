import passport from "passport-local"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { users } from "../models/users.js"

const localStategy = passport.Strategy

export const authentication = passport => {
    passport.use(new localStategy({
        usernameField: "email"
    }, (email, password, done) => {
        users.findOne({ email: email }).then(user => {
            if(!user) {
                return done(null, false, { message: "Essa conta não existe" })
            } else {
                bcrypt.compare(password, user.password, (error, beat) => {
                    if(beat) {
                        return done(null, user)
                    } else {
                        return done(null, false, { message: "Senha incorreta" })
                    }
                })
            }
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        users.findById(id, (error, user) => {
            done(error, user)
        })
    })
}