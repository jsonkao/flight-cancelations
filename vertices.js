import airports from './airports.json';
import { extent } from 'd3-array';

// Orthographic projection

function project(lon, lat) {
  const azimuth = lon * (Math.PI / 180);
  const inclination = Math.PI / 2 - lat * (Math.PI / 180);

  const x = Math.sin(inclination) * Math.cos(azimuth);
  const y = Math.sin(inclination) * Math.sin(azimuth);
  const z = Math.cos(inclination);

  if (x < 0) return false;

  return new Float32Array([y, z]);
}

console.log(
  'lon extent',
  extent(airports, d => d[0]),
);
console.log(
  'lat extent',
  extent(airports, d => d[1]),
);

export function compute_flight_paths(buffer) {
  const array = new Uint16Array(buffer);

  let vertices = [];

  for (let i = 0; i < array.length; i += 3) {
    const [from_lon, from_lat, from_china] = airports[array[i]];
    const [to_lon, to_lat, to_china] = airports[array[i + 1]];
    const count = array[i + 2];
    // vertices.push(...project(from_lon, from_lat), ...project(to_lon, to_lat));
  }

  vertices = [];
  airports.forEach(([lon, lat]) => {
    const a = project(lon, lat);
    a && vertices.push(...a);
  });
  vertices.push(0, 0);

  return new Float32Array(vertices);
}

export function compute_vertices(buffer) {
  // First uint32 (4 bytes) contain the number of line strings.
  const count = new Uint32Array(buffer, 0, 1)[0];
  // Each of the next `count` uint32s stores the vertex count of a line string.
  const indices = new Uint32Array(buffer, 4, count);
  // Rest of bytes contain vertex coordinates (alternating long-lat pairs)
  const coords = new Float32Array(buffer, 4 * (indices.length + 1));

  const vertices = [];
  let v = 0;

  for (let i = 0; i < indices.length; i += 1) {
    const len = indices[i];

    let a = project(coords[v++], coords[v++]);

    for (let j = 1; j < len; j += 1) {
      const b = project(coords[v++], coords[v++]);

      if (!a || !b) continue;

      vertices.push(...a, ...b);

      a = b;
    }
  }

  return new Float32Array(vertices);
}
