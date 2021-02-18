import mongoose from "mongoose"
const Schema = mongoose.Schema

const category = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now(),
    }
})

export const categorys = mongoose.model("categorys", category)