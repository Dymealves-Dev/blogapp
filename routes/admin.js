import express from "express"
import { categorys } from "../models/categorys.js"
import { posts } from "../models/posts.js"
import { users } from "../models/users.js"
import { permissions } from "../helpers/permissions.js"

export const admin = express.Router()

admin.get("/category", permissions.isAdmin, (req, res) => {
    categorys.find().sort({
        date: "desc"
    }).then(categorys => {
       res.render("admin/category", {
           categorys: categorys,
           page: "Administrar Categorias"
       }) 
    }).catch(error => {
        req.flash("error_msg", "Falha ao listar as categorias")
        res.redirect("/admin")
    })
    
})

admin.get("/category/create", permissions.isAdmin, (req, res) => {
    res.render("admin/category-create", {
        page: "Cadastrar Categoria"
    })
})

admin.post("/category/new", permissions.isAdmin, (req, res) => {
    const errors = []

    if(!req.body.name || typeof req.body.name === undefined || req.body.name === null) {
        errors.push({text: "Nome da categoria inválido"})
    }

    if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null) {
        errors.push({text: "Slug da categoria inválido"})
    }

    if(errors.length) {
        res.render("admin/category-create", {
            errors: errors,
            page: "Cadastrar Categoria"
        })
    } else {
        const slug = req.body.slug.toLowerCase().replace(/ /g, "-")

        const newCategory = {
            name: req.body.name,
            slug: slug
        }
    
        new categorys(newCategory).save().then(() => {
            req.flash("success_msg", "Categoria cadastrada com sucesso")
            res.redirect("/admin/category")
        }).catch(error => {
            req.flash("error_msg", "Falha ao cadastrar categoria, tente novamente mais tarde")
            res.redirect("/admin/category")
        })
    }
})

admin.get("/category/edit/:id", permissions.isAdmin, (req, res) => {
    categorys.findOne({ _id: req.params.id }).then(category => {
        res.render("admin/category-edit", {
            category: category,
            page: `Editar Categoria ${category.name}`
    })
    }).catch(error => {
        req.flash("error_msg", "Essa categoria não existe")
        res.redirect("/admin/category")
    })
})

admin.post("/category/edit", permissions.isAdmin, (req, res) => {
    const errors = []

    if(!req.body.name || typeof req.body.name === undefined || req.body.name === null) {
        errors.push({text: "Nome da categoria inválido"})
    }

    if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null) {
        errors.push({text: "Slug da categoria inválido"})
    }

    if(errors.length) {
        res.render("admin/category-edit", {
            errors: errors,
            page: `Editar Categoria ${category.name}`
        })
    } else {
        categorys.findOne({ _id: req.body.id }).then(category => {
            const slug = req.body.slug.toLowerCase().replace(/ /g, "-")
            
            category.name = req.body.name
            category.slug = slug
    
            category.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso")
                res.redirect("/admin/category")
            }).catch(error => {
                req.flash("error_msg", "Falha ao editar categoria, houve um erro interno, tente novamente mais tarde")
                res.redirect("/admin/category")
            })
        }).catch(error => {
            req.flash("error_msg", "Falha ao editar categoria, tente novamente mais tarde")
            res.redirect("/admin/category")
        })
    }
})

admin.post("/category/delete", permissions.isAdmin, (req, res) => {
    categorys.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso")
        res.redirect("/admin/category")
    }).catch(error => {
        req.flash("error_msg", "Falha ao deletar categoria")
        res.redirect("/admin/category")
    })
})

admin.get("/posts", permissions.isAdmin, (req, res) => {
    posts.find().populate("category").sort({ date: "desc" }).then(post => {
        res.render("admin/posts", {
            post: post,
            page: "Administrar Postagens"
        })
    }).catch(error => {
        req.flash("error_msg", "Falha ao exibir postagens")
        res.redirect("/")
    })
})

admin.get("/posts/create", permissions.isAdmin, (req, res) => {
    categorys.find().then(categorys => {
        res.render("admin/posts-create", {
            categorys: categorys,
            page: "Cadastrar Postagem"
        })
    }).catch(error => {
        req.flash("error_msg", "Falha ao exibir formulário de postagem")
        res.redirect("/admin/posts")
    })
})

admin.post("/posts/new", permissions.isAdmin, (req, res) => {
    const errors = []

    if(!req.body.title || typeof req.body.title === undefined || req.body.title === null) {
        errors.push({ text: "Título da postagem inválido" })
    }

    if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null) {
        errors.push({ text: "Slug da postagem inválido" })
    }

    if(!req.body.description || typeof req.body.description === undefined || req.body.description === null) {
        errors.push({ text: "Descrição da postagem inválida" })
    }

    if(!req.body.content || typeof req.body.content === undefined || req.body.content === null) {
        errors.push({ text: "Conteúdo da postagem inválido" })
    }

    if(req.body.category === "0") {
        errors.push({ text: "Categoria inválida" })
    }

    if(errors.length) {
        res.render("admin/posts-create", {
            errors: errors,
            page: "Cadastrar Postagem"
        })
    } else {
        const slug = req.body.slug.toLowerCase().replace(/ /g, "-")

        const newPost = {
            title: req.body.title,
            slug: slug,
            description: req.body.description,
            content: req.body.content,
            category: req.body.category
        }

        new posts(newPost).save().then(() => {
            req.flash("success_msg", "Postagem cadastrada com sucesso")
            res.redirect("/admin/posts")
        }).catch(error => {
            req.flash("error_msg", "Falha ao cadastrar postagem, tente novamente mais tarde")
            res.redirect("/admin/posts")
        })
    }
})

admin.get("/posts/edit/:id", permissions.isAdmin, (req, res) => {
    posts.findOne({ _id: req.params.id }).then(posts => {
        categorys.find().then(categorys => {
            res.render("admin/posts-edit", {
                posts: posts,
                categorys: categorys,
                page: `Editar Postagem ${posts.title}`
            })
        })
    }).catch(error => {
        req.flash("error_msg", "Essa postagem não existe")
        res.redirect("/admin/posts")
    })
})

admin.post("/posts/edit", permissions.isAdmin, (req, res) => {
    const errors = []

    if(!req.body.title || typeof req.body.title === undefined || req.body.title === null) {
        errors.push({ text: "Título da postagem inválido" })
    }

    if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null) {
        errors.push({ text: "Slug da postagem inválido" })
    }

    if(!req.body.description || typeof req.body.description === undefined || req.body.description === null) {
        errors.push({ text: "Descrição da postagem inválida" })
    }

    if(!req.body.content || typeof req.body.content === undefined || req.body.content === null) {
        errors.push({ text: "Conteúdo da postagem inválido" })
    }

    if(req.body.category === "0") {
        errors.push({ text: "Categoria inválida" })
    }

    if(errors.length) {
        res.render("admin/posts-edit", {
            errors: errors,
            page: "Editar Postagem"
        })
    } else {
        posts.findOne({ _id: req.body.id }).then(posts => {
            const slug = req.body.slug.toLowerCase().replace(/ /g, "-")

            posts.title = req.body.title
            posts.slug = slug
            posts.description = req.body.description
            posts.content = req.body.content
            posts.category = req.body.category
            
            posts.save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso")
                res.redirect("/admin/posts")
            }).catch(error => {
                req.flash("error_msg", "Falha ao editar postagem, houve um erro interno, tente novamente mais tarde")
                res.redirect("/admin/posts")
            })
        }).catch(error => {
            req.flash("error_msg", "Falha ao editar postagem")
            res.redirect("/admin/posts")
        })
    }
})

admin.post("/posts/delete", permissions.isAdmin, (req, res) => {
    posts.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso")
        res.redirect("/admin/posts")
    }).catch(error => {
        req.flash("error_msg", "Falha ao deletar postagem")
        res.redirect("/admin/posts")
    })
})

admin.get("/users", permissions.isAdmin, (req, res) => {
    users.find().sort({ _id: "desc" }).then(users => {
        res.render("admin/users", {
            users: users,
            page: `Administrar Usuários`
        })
    })
})

admin.post("/users/edit/:id", permissions.isAdmin, (req, res) => {
    users.findOne({ _id: req.params.id }).then(user => {
        res.render("admin/users-edit", {
            user: user,
            page: `Editar Usuário ${user.fullName}`
        })
    })
})

admin.post("/users/edit", permissions.isAdmin, (req, res) => {
    const errors = []

    if(!req.body.fullName || typeof req.body.fullName === undefined || req.body.fullName === null) {
        errors.push({ text: "Nome inválido" })
    }

    if(!req.body.permissions || typeof req.body.permissions === undefined || req.body.permissions === null) {
        errors.push({ text: "Permissão inválida" })
    }

    if(errors.length) {
        res.render("admin/users-edit", {
            errors: errors,
            page: "Editar Usuário"
        })
    } else {
        users.findOne({ _id: req.body.id }).then(user => {
            user.fullName = req.body.fullName
            user.permissions = req.body.permissions

            user.save().then(() => {
                req.flash("success_msg", "Usuário editado com sucesso")
                res.redirect("/admin/users")
            }).catch(error => {
                req.flash("error_msg", "Falha ao editar usuário, houve um erro interno, tente novamente mais tarde")
                res.redirect("/admin/users")
            })
        }).catch(error => {
            req.flash("error_msg", "Falha ao editar usuário")
            res.redirect("/admin/users")
        })
    }
})

admin.post("/users/delete", permissions.isAdmin, (req, res) => {
    users.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Usuário deletado com sucesso")
        res.redirect("/admin/users")
    }).catch(error => {
        req.flash("error_msg", "Falha ao deletar usuário")
        res.redirect("/admin/users")
    })
})