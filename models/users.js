import mongoose from "mongoose"
const Schema = mongoose.Schema

const user = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    permissions: {
        type: String,
        default: "client"
    }
})

export const users = mongoose.model("users", user)