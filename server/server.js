require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());

async function main() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const col = client.db("exoplanets").collection("planets");

  // list planets, with optional filters
  app.get("/api/planets", async (req, res) => {
    const filt = {};
    if (req.query.method) {
      filt.discoverymethod = req.query.method;
    }
    if (req.query.year) {
      filt.disc_year = Number(req.query.year);
    }
    if (req.query.search) {
      const s = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filt.pl_name = { $regex: s, $options: "i" };
    }

    let page = Number(req.query.page);
    if (!page || page < 1) {
      page = 1;
    }
    const lim = 20;

    const total = await col.countDocuments(filt);
    const planets = await col
      .find(filt)
      .sort({ pl_name: 1 })
      .skip((page - 1) * lim)
      .limit(lim)
      .toArray();

    res.json({ total: total, page: page, planets: planets });
  });

  // one planet by name
  app.get("/api/planets/:name", async (req, res) => {
    const p = await col.findOne({ pl_name: req.params.name });
    if (!p) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.json(p);
  });

  app.listen(5000, () => {
    console.log("server running on http://localhost:5000");
  });
}

main();