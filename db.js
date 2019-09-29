const mongodb = require('mongodb')
const dotenv = require('dotenv')
dotenv.config()
const connectionString = process.env.CONNECTIONSTRING
mongodb.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function (err, client) {

   module.exports =  client
   const app = require("./app")
   app.listen(process.env.PORT)

})