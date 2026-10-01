require("dotenv").config();
const { MongoClient } = require("mongodb");

const cols = "pl_name,hostname,disc_year,discoverymethod,pl_rade,pl_bmasse,pl_orbper,sy_dist";
const q = "select " + cols + " from pscomppars";
const url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=" + encodeURIComponent(q) + "&format=json";

async function main() {
  const res = await fetch(url);
  const data = await res.json();
  console.log("fetched:", data.length);

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const col = client.db("exoplanets").collection("planets");

  await col.deleteMany({});
  await col.insertMany(data);
  console.log("saved:", await col.countDocuments());

  await client.close();
}

main();