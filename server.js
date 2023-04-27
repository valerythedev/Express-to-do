const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db, collection;

const url = "mongodb+srv://valgonzr:ennIuqqxuHx0NikV@demon.5xoynxc.mongodb.net/?retryWrites=true&w=majority"
const dbName = "PPE"

app.listen(3200, () => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if (error) {
      throw error;
    }
    db = client.db(dbName);
    console.log("Connected to `" + dbName + "`!");
  });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))
// read, and displays
// .find give me everything
app.get('/', (req, res) => {
  db.collection('items').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', { list: result })
  })
})
// when someone makes a post req this would run
// my routes live on the server. 
// post adding new data. we don't know where 
// app.post('/items', (req, res) => {
//   db.collection('items').insertOne({
//     things: req.body.things,
//     dueDate: req.body.dueDate,
  
//   }, (err, result) => {
//     if (err) return console.log(err)
//     console.log('saved to database')
//     res.redirect('/')
//   })
// })
app.post('/items', (req, res) => {
  db.collection('items').insertOne({
    things: req.body.things,
    dueDate: req.body.dueDate,
  
  }, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    // res.redirect('/') // remove this line to stop the redirection
  })
})

// update
app.put('/items', (req, res) => {
  db.collection('items')
    .findOneAndUpdate({ 
      things: req.body.things, 
      dueDate: req.body.dueDate }
    , {
    //   $set: {
    //     count: req.body.count + 1
    //   }
    // }, {
      // sort: { _id: -1 },
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
})

app.delete('/items', (req, res) => {
  db.collection('items').remove(
     (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
