import { useState, useEffect } from "react";

function App() {
  const [planets, setPlanets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(function () {
    const url = "http://localhost:5000/api/planets?page=" + page + "&search=" + encodeURIComponent(search);
    fetch(url)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        setPlanets(data.planets);
        setTotal(data.total);
      });
  }, [page, search]);

  function onSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  const rows = [];
  for (let i = 0; i < planets.length; i++) {
    const p = planets[i];
    rows.push(
      <tr key={p.pl_name}>
        <td>{p.pl_name}</td>
        <td>{p.hostname}</td>
        <td>{p.disc_year}</td>
        <td>{p.discoverymethod}</td>
        <td>{p.pl_rade}</td>
      </tr>
    );
  }

  const pages = Math.ceil(total / 20);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Exoplanet Archive</h1>
      <input placeholder="Search by name..." value={search} onChange={onSearch} />
      <p>{total} planets found</p>

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Name</th>
            <th>Star</th>
            <th>Year</th>
            <th>Method</th>
            <th>Radius (Earth = 1)</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>

      <p>
        <button disabled={page <= 1} onClick={function () { setPage(page - 1); }}>
          Prev
        </button>
        <span> Page {page} of {pages} </span>
        <button disabled={page >= pages} onClick={function () { setPage(page + 1); }}>
          Next
        </button>
      </p>
    </div>
  );
}

export default App;