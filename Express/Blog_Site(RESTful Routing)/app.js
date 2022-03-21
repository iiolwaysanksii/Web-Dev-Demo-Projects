const express   = require('express'),
bodyParser      = require("body-parser"),
mongoose        = require("mongoose"),
methodOverride  = require("method-override"),
expressSanitize = require("express-sanitizer"),
app             = express(),
port            = 3000

//App Config
mongoose.connect('mongodb://localhost:27017/restful_blog_app', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(methodOverride("_method"))
app.use(expressSanitize())

//Mongoose Config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
})
var Blog = mongoose.model("Blog", blogSchema)


//RESTful Routes
app.get('/', (req, res) => res.redirect("/blogs"))

//INDEX Route -- Display All
app.get("/blogs", (req,res)=>{
    Blog.find({}, (err, blogs)=>{
        if(err){
            console.error(err)
        } else {
            res.render("index", {blogs: blogs})
        }
    })
})

//NEW Route -- Show the form for creation of new blog
app.get("/blogs/new", (req, res)=>{
    res.render("new")
})

//CREATE Route -- create the blog
app.post("/blogs", (req, res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog, (err, blog) => {
        if(err){
            res.render("new")
        } else {
            console.log(blog)
            res.redirect("/blogs")
        }
    })
})

//Show Route -- Display particular blog
app.get("/blogs/:id", (req, res)=>{
    Blog.findById(req.params.id, (err, foundBlog) =>{
        if(err){
            res.redirect("/blogs")
        } else {
            res.render("show", {blog: foundBlog})
        }
    })
})

//Edit Route -- Show the form which will update the blog
app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            res.redirect("/blogs")
        } else {
            res.render("edit", {blog:foundBlog})
        }
    })
})

//Update Route -- Update said blog
app.put("/blogs/:id", (req, res) =>{
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog)=>{
        if(err){
            res.redirect("/blogs")
        }
        else {
            res.redirect("/blogs/" + req.params.id)
        }
    })
})

//Delete Route
app.delete("/blogs/:id", (req, res)=>{
    Blog.findByIdAndRemove(req.params.id, (err)=>{
        if(err) {
            res.redirect("/blogs")
        } else {
            res.redirect("/blogs")
        }
    })
})

//App running port
app.listen(port, () => console.log(`Example app listening on port ${port}`))
