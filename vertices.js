function project(lon, lat) {
  const out = new Float32Array(2);

  const lat_radians = (lat / 180) * Math.PI;
  const lon_radians = ((lon + 90) / 180) * Math.PI;

  let x = Math.sin(lon_radians);
  let z = Math.cos(lon_radians);
  let y = Math.tan(lat_radians);

  const mag = Math.sqrt(1 + y * y);

  x /= mag;
  y /= mag;
  z /= mag;

  out[0] = x;
  out[1] = y;
  // out[2] = z;

  return out;
}

function equirectangular_project(lon, lat) {
  const out = new Float32Array(2);

  // lon ranges from around -140 to 140
  // lat ranges from around -55 to 70

  const azimuth = lon * (Math.PI / 180);
  const inclination = Math.PI / 2 - lat * (Math.PI / 180);

  const x = Math.cos(inclination) * Math.sin(azimuth);
  const y = Math.sin(inclination) * Math.sin(azimuth);
  const z = Math.cos(inclination);

  out[0] = y;
  out[1] = z;

  return out;
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

    let a = equirectangular_project(coords[v++], coords[v++]);

    for (let j = 1; j < len; j += 1) {
      const b = equirectangular_project(coords[v++], coords[v++]);

      vertices.push(...a, ...b);

      a = b;
    }
  }

  return new Float32Array(vertices);
}
