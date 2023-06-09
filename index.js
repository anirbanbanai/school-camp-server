const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const cors = require("cors");
require('dotenv').config();
const port = process.env.PORT || 5000;

// middlewere
app.use(cors())
app.use(express.json());

const veryfyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    // console.log(authorization.split(" ")[0]);
    if (!authorization) {
        return res.status(401).send({ error: "unauthorize access!" })
    }
    const token = authorization.split(" ")[1]
    jwt.verify(token, process.env.SECRET_JWT, (err, decoded) => {
        if (err) {
            return res.status(403).send({ error: "Unauthorize access!" })
        }
        // console.log(decoded);
        req.decoded = decoded;
        next()

    })
}

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.SECRET_NAME}:${process.env.SECRET_PASS}@cluster0.gmvhoig.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
// console.log(process.env.SECRET_JWT);
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const instractorCollection = client.db('sportCamp').collection('instractor')
        const classCollection = client.db('sportCamp').collection('classes')
        const selectedClassCollection = client.db('sportCamp').collection('selectedClasses')
        const usersCollection = client.db('sportCamp').collection('users')
        const cartsCollection = client.db('sportCamp').collection('cart')


        app.post('/jwt', async (req, res) => {
            const body = req.body;
            const token = jwt.sign(body, process.env.SECRET_JWT, {
                expiresIn: "1h"
            });
            res.send({ token })
        })

        app.post('/selectedClass', async (req, res) => {
            const newItems = req.body;
            const result = await selectedClassCollection.insertOne(newItems);
            res.send(result)
        })

        app.get('/ins', async (req, res) => {
            const result = await instractorCollection.find().toArray();
            res.send(result)
        });

        app.post('/ins', async(req, res)=>{
            const all = req.body;
            const result = await instractorCollection.insertOne(all);
            res.send(result)
        })
        
        app.post('/classes', async (req, res) => {
            const all = req.body;
            const result = await classCollection.insertOne(all);
            res.send(result)
        })

        app.get('/classes', async (req, res) => {
            const result = await classCollection.find().toArray();
            res.send(result);
        })
        app.get('/classesE', async (req, res) => {
            const email = req.query.email;
            const result = await classCollection.find({email: email}).toArray();
            res.send(result);
        })

        app.get('/classes/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await classCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const newItem = req.body;
            const result = await usersCollection.insertOne(newItem);
            res.send(result)
        })

        app.get('/users/admin/:email', veryfyJWT, async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            if (req.decoded.email !== email) {
                return res.send({ admin: false })
            }
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.role === 'admin' };
            return res.send(result)
        })
        app.get('/users/ins/:email', veryfyJWT, async (req, res) => {
            const email = req.params.email;
            if (req.decoded.email !== email) {
                return res.send({ instractor: false })
            }
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const result = { instractor: user?.role === 'instractor' };
            res.send(result)
        })

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateItem = {
                $set: {
                    role: "admin"
                }
            }
            const result = await usersCollection.updateOne(query, updateItem);
            res.send(result)
        })

        app.patch('/users/ins/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateItem = {
                $set: {
                    role: "instractor"
                }
            }
            const result = await usersCollection.updateOne(query, updateItem);
            res.send(result)
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result)
        })

        // app.patch('/user/instractor/:id', async(req, res)=>{
        //     const id = req.params.id;
        //     const query = {_id: new ObjectId(id)};
        //     const updateItem={
        //         $set:{
        //             role:"instractor"
        //         }
        //     }
        //     const result = await usersCollection.updateOne(query, updateItem);
        //     res.send(result)
        // })

        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.use('/', (req, res) => {
    res.send('Assignment 12 running')
})
app.listen(port, (req, res) => {
    console.log(`This is server running on ${port}`);
})