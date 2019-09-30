const User = require("../models/User")
const Post = require("../models/Post")

exports.mustBeLoggedIn = function (req, res, next) {
    if (req.session.user) {
        next()
    } else {
        req.flash("errors", "You must be logged in.")
        req.session.save(() => {
            res.redirect("/")
        })
    }
}

exports.login = function (req, res) {

    let user = new User(req.body)
    user.login().then((result) => {
        req.session.user = {
            username: user.data.username,
            avatar: user.avatar,
            _id: user.data._id
        }
        req.session.save(() => {
            res.redirect("/")
        })
    }).catch((err) => {
        req.flash("errors", err)
        req.session.save(() => {

            res.redirect("/")
        })

    })
}

exports.logout = function (req, res) {
    req.session.destroy(() => {
        res.redirect("/")
    })


}

exports.register = function (req, res) {
    let user = new User(req.body)
    user.register().then(() => {
        req.session.user = {
            avatar: user.avatar,
            username: user.data.username,
            _id: user.data._id
        }
        req.session.save(() => {
            res.redirect("/")
        })


    }).catch(regErrors => {
        regErrors.forEach(error => {
            req.flash("regErrors", error)


        })
        req.session.save(() => {
            res.redirect("/")
        })


    })
}

exports.home = function (req, res) {
    // res.render('home-guest')
    if (req.session.user) {
        res.render("home-dashboard")
    } else {

        res.render("home-guest", {

            errors: req.flash("errors"),
            regErrors: req.flash("regErrors")
        })
    }
}


exports.ifUserExists = function (req, res, next) {
    User.findByUserName(req.params.username)
        .then((userDoc) => {
            req.profileUser = userDoc
            next()
        })

        .catch(() => {
            res.render("404")
        })
}

exports.profilePostsScreen = function (req, res) {
    Post.findByAuthorId(req.profileUser._id).then((posts) => {
        res.render('profile', {
            posts: posts,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar

        })
    }).catch((err) => {

        res.render("404")

    });


}