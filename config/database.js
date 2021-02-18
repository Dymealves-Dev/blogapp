export const mongoURI = () => {
    if(process.env.NODE_ENV == "production") {
        return "mongodb+srv://DymeAlves:U6pxSHrha8XyhVAK@cluster0.lawml.mongodb.net/Cluster0?retryWrites=true&w=majority"
    } else {
        return "mongodb://localhost/blogapp"
    }
}