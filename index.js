const express = require('express')
const app = express()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cf9qr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {

        await client.connect();
        const database = client.db('camera_world');
        const camerasCollection = database.collection('cameras');
        const ordersCollection = database.collection('orders');
        const userCollection = database.collection('users');
        const ratingsCollection = database.collection('ratings');
        // app.post('/cameras', async (req, res) => {

        // })
        // Get cameras
        // app.get('/orders', async (req, res) => {
        //     const cursor = ordersCollection.find({});
        //     const orders = await cursor.toArray();
        //     res.send(orders);
        // });

        app.get('/orders', async (req, res) => {
            let query = {};
            const email = req.query.email;
            if (email) {
                query = { email: email };
            }
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });


        // app.get('/orders/:id', async (req, res) => {
        //     const id1 = req.params.id1;
        //     const query = { _id: ObjectId(id1) };
        //     const order = await ordersCollection.findOne(query);
        //     res.json(order);



        app.get('/cameras', async (req, res) => {
            const cursor = camerasCollection.find({});
            const cameras = await cursor.toArray();
            res.send(cameras);
        })
        app.get('/reviews', async (req, res) => {
            const cursor = ratingsCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        })
        app.get('/cameras/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const camera = await camerasCollection.findOne(query);
            res.json(camera);
        })
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const orders = await ordersCollection.findOne(query);
            res.json(orders);
        })
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find({});
            const user = await cursor.toArray();
            res.send(user);

        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })

        })


        app.post('/cameras', async (req, res) => {
            const camera = req.body;

            console.log('hit post');

            const result = await camerasCollection.insertOne(camera);
            console.log(result);
            res.json(result)

        });

        app.post('/users', async (req, res) => {
            const user = req.body;

            const result = await userCollection.insertOne(user);
            res.json(result);

        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);

        })
        app.put('/orders/:id', async (req, res) => {

            const id = req.params.id;
            const updatedOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {

                $set: {
                    status: updatedOrder.status,
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options)

            res.json(result);
        }

        )
        app.post('/orders', async (req, res) => {
            const order = req.body;

            const result = await ordersCollection.insertOne(order);
            res.json(result);


        });
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });

        app.delete('/cameras/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await camerasCollection.deleteOne(query);
            res.json(result);
        });




        app.post('/reviews', async (req, res) => {
            const review = req.body;

            const result = await ratingsCollection.insertOne(review);
            res.json(result);

        });
    }
    finally {

    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.listen(port, () => {
    console.log(`${port}`)
})