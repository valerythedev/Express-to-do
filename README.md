

## Installation

1. Clone repo
2. run `npm install`

## Usage

1. run `npm run savage`
2. Navigate to `localhost:3200`

or https://to-do-list-by5p.onrender.com/

This is a piece of code written in JavaScript using the Node.js framework. It defines a web server that listens on port 3200 and connects to a MongoDB database using the MongoDB Node.js driver. Here's a brief breakdown of what the code does:

The code imports the express, body-parser, and mongodb modules using the require function.

It initializes an instance of the express application.

It sets the view engine to ejs, which allows us to render dynamic HTML pages.

It sets up middleware to handle incoming HTTP requests with JSON and urlencoded data.

It sets up a static file server to serve files from the public directory.

It connects to a MongoDB database using the MongoClient from the mongodb module.

It defines four routes:

a. A GET route for the root URL (/) that retrieves all items from the database and renders them in the index.ejs template.

b. A POST route for the /items URL that adds a new item to the database.

c. A PUT route for the /items URL that updates an existing item in the database.

d. A DELETE route for the /items URL that removes all items from the database.

The code is using callback functions to handle database operations asynchronously. The connect method from MongoClient connects to the MongoDB database and returns a client object that we can use to interact with the database. The toArray method from the collection object retrieves all items from the database as an array of JavaScript objects. The insertOne method from the collection object adds a new item to the database. The findOneAndUpdate method from the collection object updates an existing item in the database. The remove method from the collection object removes all items from the database.
