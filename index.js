const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9mirr.mongodb.net/burjAlArab?retryWrites=true&w=majority`;

const app = express()
app.use(cors())
app.use(bodyParser.json())

const serviceAccount = require("./configs/burj-al-arab-76594-firebase-adminsdk-hutxt-d4046da914.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  
  console.log('Database connection Success',process.env.PORT);
//post bookings
  app.post('/addBooking' , (req,res) => {
      const newBooking = req.body;
      bookings.insertOne(newBooking)
      .then(result =>{
          res.send(result.insertedCount > 0)
      })
      console.log(newBooking);
  })

 // api

    app.get('/api', (req,res) =>{
        // console.log(req.query.email);
        // console.log(req.headers.authorization);
        const bearer = req.headers.authorization;

        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            // console.log({idToken});
            admin.auth().verifyIdToken(idToken)
            .then((decodedToken) => {
                const tokenEmail = decodedToken.email;
                const queryEmail = req.query.email;
                // console.log(queryEmail, tokenEmail);
                if (tokenEmail == queryEmail){
                    bookings.find({email:queryEmail})
                    .toArray((err, document) =>{
                        res.status(200).send(document)
                    })
                }
                else{
                    res.status(401).send('Unauthorized Access')
                }
            })
            .catch((error) => {
                res.status(401).send('Unauthorized Access')
            });

        }else{
            res.status(401).send('Unauthorized Access')
        }

        

       
    })
});


app.get('/',(req,res) => {
    res.send('hello world')
})


app.listen(3001)