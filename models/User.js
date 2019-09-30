const validator = require("validator")
const usersCollection = require('../db').db().collection('users')
const bcrypt = require("bcryptjs")
const md5 = require('md5')
let User = function (data, getAvatarURL) {
    this.data = data
    this.errors = []
    if (getAvatarURL == undefined) {
        getAvatarURL = false
    }
    if (getAvatarURL) {
        this.getAvatar()
    }
}

User.prototype.validate = function () {
    return new Promise(async (resolve, reject) => {



        //Email Vlidation
        if (this.data.username == "") {
            this.errors.push("You must provide a username.")
        }
        if (this.data.username.length > 0 && this.data.username.length < 3) {
            this.errors.push("Username must be at least 3 characters.")
        }
        if (this.data.username > 100) {
            this.errors.push("Username cannot exceed 100 characters.")
        }
        if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {
            this.errors.push("Only letters and numbers..")
        }

        //Email Validation
        if (!validator.isEmail(this.data.email)) {
            this.errors.push("You must provide a valid email.")
        }

        //Password Validation
        if (this.data.password == "") {
            this.errors.push("You must provide a password.")
        }
        if (this.data.password.length > 0 && this.data.password.length < 8) {
            this.errors.push("Password must be at least 8 characters.")
        }

        if (this.data.password.length > 100) {
            this.errors.push("Password cannot exceed 100 characters.")
        }

        //Check if username is good.

        if (this.data.username.length > 3 && this.data.username.length < 30 && validator.isAlphanumeric(this.data.username)) {
            let userNameExists = await usersCollection.findOne({
                username: this.data.username
            })
            if (userNameExists) {
                this.errors.push("Username already taken.")
            }
        }

        if (validator.isEmail(this.data.email)) {
            let emailExists = await usersCollection.findOne({
                email: this.data.email
            })
            if (emailExists) {
                this.errors.push("Email already taken.")
            }

            resolve()
        }



    })
}




User.prototype.cleanUp = function () {
    if (typeof (this.data.username) != "string") {
        this.data.username = ""
    }
    if (typeof (this.data.email) != "string") {
        this.data.email = ""
    }
    if (typeof (this.data.password) != "string") {
        this.data.password = ""
    }

    //get rid of any other properties

    this.data = {
        username: this.data.username.trim().toLowerCase(),
        password: this.data.password,
        email: this.data.email.trim().toLowerCase()
    }
}


User.prototype.register = function () {
    return new Promise(async (resolve, reject) => {
        //Step #1 : Validate User Data
        this.cleanUp()
        await this.validate()
        //Step #2 : Only if there are no error,
        //          then save the user data.

        if (!this.errors.length) {
            //hash user password
            let salt = bcrypt.genSaltSync(10)
            this.data.password = bcrypt.hashSync(this.data.password, salt)
            usersCollection.insertOne(this.data)
            this.getAvatar()
            resolve()
        } else {
            reject(this.errors)
        }



    })
}

User.prototype.login = function () {

    return new Promise((resolve, reject) => {
        this.cleanUp()
        usersCollection.findOne({
            username: this.data.username
        }).then(user => {
            if (user && bcrypt.compareSync(this.data.password, user.password)) {
                this.data = user
                this.getAvatar()
                resolve("Correct User and Password")
            } else {
                reject("Invalid User ID or Password")
            }
        }).catch(err => {
            reject("Please try again later.")
        })
    })


}

User.prototype.getAvatar = function () {

    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

User.findByUserName = function (username) {
    return new Promise((resolve, reject) => {
        if (typeof (username) != "string") {
            reject()
            return
        }

        usersCollection.findOne({
            username: username
        })
        .then((userDoc) => {

            

            if (userDoc) {
                userDoc = new User(userDoc, true)
                
                userDoc = {
                    _id : userDoc.data._id,
                    username: userDoc.data.username,
                    avatar : userDoc.avatar
                }
            resolve(userDoc)
            
            } else {
                reject()
            }

        }).catch(() => {
            reject()
        })
    });
}
module.exports = User