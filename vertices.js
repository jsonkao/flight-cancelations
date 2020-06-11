import airports from './airports.json';

// Orthographic projection

function project(lon, lat) {
  const azimuth = lon * (Math.PI / 180) - Math.PI / 2;
  const inclination = Math.PI / 2 - lat * (Math.PI / 180);

  const x = Math.sin(inclination) * Math.cos(azimuth);
  const y = Math.sin(inclination) * Math.sin(azimuth);
  const z = Math.cos(inclination);

  if (x < 0) return false;

  return new Float32Array([y, z]);
}

export function compute_flight_paths(buffer) {
  // A sequence of [from_index, to_index, count] tuples, where from_index and
  // to_index are indexes in airports.json. Each entry in airports.json is
  // [lon, lat, is_china]
  const array = new Uint16Array(buffer);

  const depart_points = [];
  const arrive_points = [];

  const depart_centers = [];
  const arrive_centers = [];

  const point_index = [];

  const size = 0.1; // Also equals 2/3 * altitude because we're at centroid

  for (let i = 0; i < 20; i += 3) {
    const [from_lon, from_lat, from_china] = airports[array[i]];
    const [to_lon, to_lat, to_china] = airports[array[i + 1]];

    const depart_point = project(from_lon, from_lat);
    const arrive_point = project(to_lon, to_lat);

    if (!depart_point || !arrive_point) continue;

    const [depart_x, depart_y] = depart_point;
    const [arrive_x, arrive_y] = arrive_point;

    // Treat each point as the centroid of a triangle. Construct a triangle
    // with vertices 0deg, 120deg, and 240deg from the angle of the flight.

    const vector_angle = Math.atan2(arrive_y - depart_y, arrive_x - depart_x);

    for (let j = 0; j < 3; j++) {
      const theta = vector_angle - j * (2 / 3) * Math.PI;

      const dx = size * Math.cos(theta);
      const dy = size * Math.sin(theta);

      depart_points.push(depart_x + dx, depart_y + dy);
      arrive_points.push(arrive_x + dx, arrive_y + dy);

      depart_centers.push(depart_x, depart_y);
      arrive_centers.push(arrive_x, arrive_y);

      point_index.push(j);
    }
  }

  return {
    depart_point: depart_points,
    arrive_point: arrive_points,
    depart_center: depart_centers,
    arrive_center: arrive_centers,
    point_index,
    size,
  };
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
