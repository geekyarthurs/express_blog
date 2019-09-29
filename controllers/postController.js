const Post = require('../models/Post')

exports.viewCreateScreen = function (req, res) {
    res.render("create-post")
}

exports.create = function (req, res) {
    let post = new Post(req.body, req.session.user._id)
    post.create().then(() => {
        //redirect to new url for that post. and a flash message.
        res.send("New Post Created")
    }).catch((errors) => {
        res.send(errors)
    })
}

exports.viewSingle = async function (req, res) {
    try {
        let post = await Post.findSingleById(req.params.id)
        res.render('single-post-screen', {
            post: post
        })

    } catch (err) {
        res.render("404")
    }
}