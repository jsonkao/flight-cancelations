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

}

export function compute_vertices(buffer) {
  // First 4 bytes contain the number of "indices"
  const count = new Uint32Array(buffer, 0, 1)[0];
  // Next 4 * count bytes stores the indices
  const indices = new Uint32Array(buffer, 4, count);
  // Rest of bytes contain float coordinates (alternating lon-lat pairs)
  const coords = new Float32Array(buffer, 4 * (indices.length + 1));

  const vertices = [];
  let v = 0;

  // Seems like this is constructing an array of pairs of coordinates.
  // Each "index" represents some count of coordinates.
  // And it just keeps drawing lines between two points.
  for (let i = 0; i < indices.length; i += 1) {
    const len = indices[i];

    let a = project(coords[v++], coords[v++]);

    for (let j = 1; j < len; j += 1) {
      const b = project(coords[v++], coords[v++]);

      vertices.push(...a, ...b);

      a = b;
    }
  }

  return new Float32Array(vertices);
}
