const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

let _db
const mongoConnect = (callback) => {
    // MongoClient.connect('mongodb://localhost/node-app')
    MongoClient.connect('mongodb+srv:...')
        .then(client => {
            _db = client.db()
            callback()
        })
        .catch(err => console.log(err))
}

const getdb = () => {
    if (_db){
        return _db
    }
    throw 'No Database!'
}

exports.mongoConnect = mongoConnect
exports.getdb = getdb
