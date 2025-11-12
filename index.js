const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");
require("dotenv").config();
const serviceAccount = require("./serviceKey.json");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// home
// EGb5jyKkFCgwytUh
// home_hero

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uri = `mongodb+srv://home_hero:EGb5jyKkFCgwytUh@cluster0.qzimykk.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// const verifyToken = async (req, res, next) => {
//   const authorization = req.headers.authorization;

//   if (!authorization) {
//     return res.status(401).send({ message: "Unauthorized: Token missing" });
//   }
//   const token = authorization.split(" ")[1];

//   try {
//     const decoded = await admin.auth().verifyIdToken(token);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).send({ message: "Forbidden: Invalid token" });
//   }
// };

async function run() {
  try {
    await client.connect();

    const db = client.db("home_hero");
    const serviceCollection = db.collection("services");
    console.log(serviceCollection);

    const bookingCollection = db.collection("bookings");

    // find
    // filter
    //aaaaaaaaaaaaaaaaa
    app.get("/services", async (req, res) => {
      const { minPrice, maxPrice } = req.query;
      let filter = {};

      if (minPrice && maxPrice) {
        filter.price = {
          $gte: parseFloat(minPrice),
          $lte: parseFloat(maxPrice),
        };
      } else if (minPrice) {
        filter.price = { $gte: parseFloat(minPrice) };
      } else if (maxPrice) {
        filter.price = { $lte: parseFloat(maxPrice) };
      }

      const result = await serviceCollection
        .find(filter)
        .sort({ price: 1 })
        .toArray();
      res.send(result);
    });
    //aaaaaaaaaaaaa

    app.get("/services/:id", async (req, res) => {
      const { id } = req.params;

      const objectId = new ObjectId(id);
      const result = await serviceCollection.findOne({ _id: objectId });
      res.send({ success: true, result });
    });

    // post method
    // insertOne
    app.post("/services", async (req, res) => {
      const data = req.body;
      const result = await serviceCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    });

    // POST /services/:id/review
    // Add review to a service
    app.post("/services/:id/reviews", async (req, res) => {
      try {
        const id = req.params.id;
        const review = req.body; // { userEmail, userName, rating, comment, date }

        const result = await serviceCollection.updateOne(
          { _id: new ObjectId(id) },
          { $push: { reviews: review } }
        );

        res.send({ success: true, result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to add review" });
      }
    });

    // ✅ Top 6 Rated Services API
    app.get("/services/top-rated", async (req, res) => {
      try {
        const services = await serviceCollection
          .aggregate([
            {
              $addFields: {
                avgRating: { $avg: "$reviews.rating" }, // reviews 
              },
            },
            { $sort: { avgRating: -1 } },
            { $limit: 6 }, 
          ])
          .toArray();

        res.json(services);
      } catch (error) {
        console.error("Error fetching top-rated services:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // PUT
    // updateOne
    app.put("/services/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const objectId = new ObjectId(id);
      const filter = { _id: objectId };
      const update = {
        $set: data,
      };
      const result = await serviceCollection.updateOne(filter, update);
      res.send({ success: true, result });
    });

    // delete
    app.delete("/services/:id", async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);
      const filter = { _id: objectId };
      const result = await serviceCollection.deleteOne(filter);
      res.send({ success: true, result });
    });

    // latest 6 data /get/find
    app.get("/latest-services", async (req, res) => {
      const result = await serviceCollection
        .find()
        .sort({ created_at: "asc" })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/my-services", async (req, res) => {
      const email = req.query.email;
      const result = await serviceCollection
        .find({ created_by: email })
        .toArray();
      res.send(result);
    });

    // Booking a service id
    app.post("/bookings/:id", async (req, res) => {
      try {
        const serviceId = req.params.id;
        const { booked_by, bookingDate, price } = req.body;
        const service = await serviceCollection.findOne({
          _id: new ObjectId(serviceId),
        });
        if (!service)
          return res.status(404).send({ message: "Service not found" });

        const bookingData = {
          booked_by,
          serviceId,
          service: {
            _id: service._id,
            name: service.name,
            category: service.category,
            price: service.price,
          },
          bookingDate,
          price,
          createdAt: new Date(),
        };
        const result = await bookingCollection.insertOne(bookingData);

        // Increment service bookings count
        await serviceCollection.updateOne(
          { _id: new ObjectId(serviceId) },
          { $inc: { bookings: 1 } }
        );
        res.send({ result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Booking failed" });
      }
    });

    // GET my bookings
    app.get("/my-bookings", async (req, res) => {
      try {
        const email = req.query.email;
        const bookings = await bookingCollection
          .find({ booked_by: email })
          .toArray();
        res.send(bookings);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to fetch bookings" });
      }
    });

    // DELETE booking
    app.delete("/bookings/:id", async (req, res) => {
      try {
        const bookingId = req.params.id;
        const booking = await bookingCollection.findOne({
          _id: new ObjectId(bookingId),
        });
        if (!booking)
          return res.status(404).send({ message: "Booking not found" });
        await bookingCollection.deleteOne({ _id: new ObjectId(bookingId) });
        await serviceCollection.updateOne(
          { _id: new ObjectId(booking.serviceId) },
          { $inc: { bookings: -1 } }
        );

        res.send({ message: "Booking canceled" });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to cancel booking" });
      }
    });

    // search card
    app.get("/search", async (req, res) => {
      const search_text = req.query.search;
      const result = await serviceCollection
        .find({ name: { $regex: search_text, $options: "i" } })
        .toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you stop the server
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World! Md Samim Boss");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
