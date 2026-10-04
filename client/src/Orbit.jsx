import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function Orbit(props) {
  const box = useRef(null);
  const p = props.planet;

  // orbit size in AU: use NASA's value, or estimate it from the period
  let m = 1;
  if (p.st_mass) {
    m = p.st_mass;
  }
  let a = p.pl_orbsmax;
  let note = "Orbit radius " + a + " AU";
  if (!a) {
    const yrs = p.pl_orbper / 365.25;
    a = Math.cbrt(m * yrs * yrs);
    note = "Orbit radius about " + a.toFixed(3) + " AU, estimated from the period";
  }

  // orbit shape: 0 means a perfect circle
  let e = 0;
  if (p.pl_orbeccent) {
    e = p.pl_orbeccent;
    note = note + ", eccentricity " + e;
  } else {
    note = note + ", circular orbit assumed";
  }

  useEffect(function () {
    if (!(a > 0)) {
      return;
    }
    const el = box.current;
    const w = el.clientWidth;
    const h = 380;

    // shrink or grow the orbit so the far point is always 10 units away
    const sc = 10 / (a * (1 + e));

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    cam.position.set(0, 9, 15);

    const ren = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    ren.setSize(w, h);
    ren.setPixelRatio(window.devicePixelRatio);
    el.appendChild(ren.domElement);

    const ctl = new OrbitControls(cam, ren.domElement);
    ctl.enableDamping = true;

    // the star, at the center
    const star = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffcf8a })
    );
    scene.add(star);

    // the orbit path: a loop that places 200 points around the oval
    const pts = [];
    for (let i = 0; i < 200; i++) {
      const t = (i / 200) * 2 * Math.PI;
      const r = ((a * (1 - e * e)) / (1 + e * Math.cos(t))) * sc;
      pts.push(new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)));
    }
    const line = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x8f9ab8 })
    );
    scene.add(line);

    // the planet
    const pl = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 32),
      new THREE.MeshBasicMaterial({ color: props.col })
    );
    scene.add(pl);

    // the animation loop: runs about 60 times a second
    let id = 0;
    function loop(now) {
      // one orbit takes 12 seconds on screen
      const mean = ((now / 12000) * 2 * Math.PI) % (2 * Math.PI);

      // solve Kepler's equation for E by repeated guessing (Newton's method)
      let E = mean;
      if (e > 0.8) {
        E = Math.PI;
      }
      for (let i = 0; i < 15; i++) {
        E = E - (E - e * Math.sin(E) - mean) / (1 - e * Math.cos(E));
      }

      // angle and distance of the planet at this moment
      const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
      const r = a * (1 - e * Math.cos(E)) * sc;
      pl.position.set(r * Math.cos(nu), 0, r * Math.sin(nu));

      ctl.update();
      ren.render(scene, cam);
      id = requestAnimationFrame(loop);
    }
    id = requestAnimationFrame(loop);

    // cleanup: runs when the planet changes or the panel closes
    return function () {
      cancelAnimationFrame(id);
      ctl.dispose();
      ren.dispose();
      el.removeChild(ren.domElement);
    };
  }, [a, e, props.col]);

  if (!(a > 0)) {
    return <p className="note">This planet has no orbit data yet.</p>;
  }

  return (
    <div>
      <div ref={box} className="view"></div>
      <p className="note">
        {note}. The tilt of the orbit is unknown, so only its shape and relative size are real. One loop takes 12 seconds here, whatever the real period.
      </p>
    </div>
  );
}

export default Orbit;