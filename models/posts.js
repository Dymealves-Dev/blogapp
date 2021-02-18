import mongoose from "mongoose"
const Schema = mongoose.Schema

const post = new Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "categorys",
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

export const posts = mongoose.model("posts", post)