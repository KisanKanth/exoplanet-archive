import { useState, useEffect } from "react";
import Orbit from "./Orbit.jsx";

const meths = ["Transit", "Radial Velocity", "Microlensing", "Imaging", "Transit Timing Variations", "Eclipse Timing Variations", "Astrometry"];

const cols = {
  "Transit": ["#9beaff", "#1b5fd1"],
  "Radial Velocity": ["#ffd0a0", "#c2410c"],
  "Microlensing": ["#ffb0e0", "#8b2f9c"],
  "Imaging": ["#caf7b4", "#2f8f4e"],
};
const dflt = ["#d4daf0", "#4b5580"];

function show(v) {
  if (v === null || v === undefined) {
    return <span className="na">N/A</span>;
  }
  return v;
}

function orb(p) {
  let c = cols[p.discoverymethod];
  if (!c) {
    c = dflt;
  }
  let s = 14;
  if (p.pl_rade) {
    s = 14 + Math.min(p.pl_rade, 20) * 1.5;
  }
  const st = {
    width: s,
    height: s,
    background: "radial-gradient(circle at 30% 30%, " + c[0] + ", " + c[1] + " 70%)",
    boxShadow: "0 0 " + (s / 2) + "px " + c[1],
  };
  return <span className="orb" style={st}></span>;
}

function App() {
  const [planets, setPlanets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("");
  const [sel, setSel] = useState(null);

  useEffect(function () {
    const url = "http://localhost:5000/api/planets?page=" + page
      + "&search=" + encodeURIComponent(search)
      + "&method=" + encodeURIComponent(method);
    fetch(url)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        setPlanets(data.planets);
        setTotal(data.total);
      });
  }, [page, search, method]);

  function onSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function onMethod(e) {
    setMethod(e.target.value);
    setPage(1);
  }

  function pick(p) {
    setSel(p);
    window.scrollTo(0, 0);
  }

  const opts = [<option key="all" value="">All methods</option>];
  for (let i = 0; i < meths.length; i++) {
    opts.push(<option key={meths[i]} value={meths[i]}>{meths[i]}</option>);
  }

  const rows = [];
  for (let i = 0; i < planets.length; i++) {
    const p = planets[i];
    rows.push(
      <tr key={p.pl_name} className="row" onClick={function () { pick(p); }}>
        <td>
          <div className="nm">
            <span className="ob">{orb(p)}</span>
            <span>{p.pl_name}</span>
          </div>
        </td>
        <td>{p.hostname}</td>
        <td>{show(p.disc_year)}</td>
        <td>{p.discoverymethod}</td>
        <td>{show(p.pl_rade)}</td>
      </tr>
    );
  }

  let view = null;
  if (sel) {
    let c = cols[sel.discoverymethod];
    if (!c) {
      c = dflt;
    }
    view = (
      <div className="panel">
        <div className="ph">
          <b>{sel.pl_name}</b>
          <button onClick={function () { setSel(null); }}>Close</button>
        </div>
        <Orbit planet={sel} col={c[0]} />
      </div>
    );
  }

  const pages = Math.ceil(total / 20);

  return (
    <div className="wrap">
      <header className="hero">
        <div className="world"></div>
        <h1>Worlds beyond our Sun</h1>
        <p className="lead">
          Every confirmed exoplanet in NASA's archive. Search by name, or filter by how the planet was found.
        </p>
        <div className="bar">
          <input placeholder="Search by name, like Kepler-186" value={search} onChange={onSearch} />
          <select value={method} onChange={onMethod}>{opts}</select>
        </div>
      </header>

      {view}

      <p className="count">{total} planets found</p>

      <div className="box">
        <table>
          <thead>
            <tr>
              <th>Planet</th>
              <th>Star</th>
              <th>Year found</th>
              <th>Method</th>
              <th>Radius (Earth = 1)</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>

      <div className="pager">
        <button disabled={page <= 1} onClick={function () { setPage(page - 1); }}>
          Previous
        </button>
        <span>Page {page} of {pages}</span>
        <button disabled={page >= pages} onClick={function () { setPage(page + 1); }}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;