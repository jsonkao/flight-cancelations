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

  const lon_radians = (lon + 90) * (Math.PI / 180);
  const lat_radians = lat * (Math.PI / 180);

  const x = Math.cos(lat_radians) * Math.cos(lon_radians);
  const y = Math.sin(lat_radians);

  out[0] = x;
  out[1] = y;

  return out;
}

export function compute_vertices(buffer) {
  // First 4 bytes contain the number of "indices"
  // Each "indices" is a count of how many vertices are in a line.
  const count = new Uint32Array(buffer, 0, 1)[0];
  // Next 4 * count bytes stores the vertex counts
  const indices = new Uint32Array(buffer, 4, count);
  // Rest of bytes contain float coordinates (alternating lon-lat pairs)
  const coords = new Float32Array(buffer, 4 * (indices.length + 1));

  const vertices = [];
  let v = 0;

  // Constructing line strings. `indices` is a list of linestring sizes.
  for (let i = 0; i < indices.length; i += 1) {
    const len = indices[i];

    let a = equirectangular_project(coords[v++], coords[v++]);

    for (let j = 1; j < len; j += 1) {
      const b = equirectangular_project(coords[v++], coords[v++]);

      vertices.push(...a, ...b);

      a = b;
    }
  }

  console.log('coords :>> ', coords);
  return new Float32Array(vertices);
}
