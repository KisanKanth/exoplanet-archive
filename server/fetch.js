const cols = "pl_name,hostname,disc_year,discoverymethod,pl_rade,pl_bmasse,pl_orbper,sy_dist";
const q = "select " + cols + " from pscomppars";
const url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=" + encodeURIComponent(q) + "&format=json";

async function main() {
  const res = await fetch(url);
  const data = await res.json();
  console.log("total planets:", data.length);
  for (let i = 0; i < 3; i++) {
    console.log(data[i]);
  }
}

main();