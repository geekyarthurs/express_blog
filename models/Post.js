const postsCollection = require("../db").db().collection("posts")
const {
    ObjectID
} = require('mongodb');
const User = require("./User")
let Post = function (data, _id) {

    this.data = data
    this.errors = []
    this.userid = _id


}


Post.prototype.cleanUp = function () {
    if (typeof (this.data.title) != "string") {
        this.data.title = ""
    }
    if (typeof (this.data.body) != "string") {
        this.data.body = ""
    }
    this.data = {
        author: ObjectID(this.userid),
        title: this.data.title.trim(),
        body: this.data.body.trim(),
        createdDate: new Date()
    }
}
Post.prototype.validate = function () {

    if (this.data.title == "") this.errors.push("You must provide a title.")
    if (this.data.body == "") this.errors.push("You must provide some content.")


}

Post.prototype.create = function () {
    this.cleanUp()
    this.validate()
    return new Promise((resolve, reject) => {


        if (!this.errors.length) {


            postsCollection.insertOne(this.data)
                .then(() => {
                    resolve()
                })
                .catch(() => {
                    this.errors.push("Please try again later.")
                    reject(this.errors)
                })


        } else {
            reject(this.errors)
        }
    })


}

Post.findSingleById = function (id) {
    return new Promise(async function (resolve, reject) {
        if (typeof (id) != "string" || !ObjectID.isValid(id)) {
            reject()
            return
        } else {
            let posts = await postsCollection.aggregate([{
                    $match: {
                        _id: new ObjectID(id)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "author",
                        foreignField: "_id",
                        as: "authorDocument",

                    }
                },
                {
                    $project: {
                        title: 1,
                        body: 1,
                        createdDate: 1,
                        author: {
                            $arrayElemAt: ["$authorDocument", 0]
                        }
                    }
                }
            ]).toArray()

            //clean up author property
            console.log(posts)
            posts = posts.map(function (post) {
                post.author = {
                    username: post.author.username,
                    avatar: new User(post.author, true).avatar
                }
                return post
            })
            console.log(posts)
            if (posts.length) {
                console.log(posts[0])
                resolve(posts[0])
            } else {
                reject()
            }
        }
    })
}
Post.reusablePostQuery = function (uniqueOperations) {
    return new Promise(async function (resolve, reject) {
        let aggOperations = uniqueOperations.concat([{
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "authorDocument",

            }
        },
        {
            $project: {
                title: 1,
                body: 1,
                createdDate: 1,
                author: {
                    $arrayElemAt: ["$authorDocument", 0]
                }
            }
        }])
        let posts = await postsCollection.aggregate(aggOperations).toArray()

        //clean up author property
        console.log(posts)
        posts = posts.map(function (post) {
            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }
            return post
        })
        resolve(posts)
    })
}




module.exports = Post