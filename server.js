const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const dotenv = require('dotenv')


dotenv.config();
const url = process.env.MONGO

const dbName = "PPE"
var db, collection;

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
  console.log('Route handler for / called'); // Log to indicate that the route handler is being executed

  if (db) {
    console.log('db object is defined'); // Log to check if db object is defined
    console.log('Attempting to access db.collection(\'items\')');

    // Check if the 'collection' property is defined in the db object
    if (db.collection) {
      console.log('db.collection is defined');
      db.collection('items').find().toArray((err, result) => {
        if (err) {
          console.error('Error querying the database:', err); // Log any errors during the query
          res.status(500).send('Database query error');
        } else {
          console.log('Query successful');
          res.render('index.ejs', { list: result });
        }
      });
    } else {
      console.error('db.collection is not defined'); // Log if 'collection' property is not defined
      res.status(500).send('Database collection error');
    }
  } else {
    console.error('db is not defined'); // Log if db object is not defined
    res.status(500).send('Database connection error');
  }
});


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
      dueDate: req.body.dueDate
    }
      , {
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
