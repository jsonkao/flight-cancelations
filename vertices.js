import airports from './airports.json';

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

  const size = 0.03; // Also equals 2/3 * altitude because we're at centroid

  for (let i = 0; i < array.length; i += 3) {
    const [depart_lon, depart_lat, depart_china] = airports[array[i]];
    const [arrive_lon, arrive_lat, arrive_china] = airports[array[i + 1]];

    // Treat each point as the centroid of a triangle. Construct a triangle
    // with vertices 0deg, 120deg, and 240deg from the angle of the flight.

    const vector_angle = Math.atan2(arrive_lat - depart_lat, arrive_lon - depart_lon);

    for (let j = 0; j < 3; j++) {
      const theta = vector_angle - j * (2 / 3) * Math.PI;

      const dx = size * Math.cos(theta);
      const dy = size * Math.sin(theta);

      depart_points.push(depart_lon + dx, depart_lat + dy);
      arrive_points.push(arrive_lon + dx, arrive_lat + dy);

      depart_centers.push(depart_lon, depart_lat);
      arrive_centers.push(arrive_lon, arrive_lat);
      point_index.push(j);
    }
  }

  return {
    // a_depart_point: depart_points,
    // a_arrive_point: arrive_points,
    a_depart_center: depart_centers,
    a_arrive_center: arrive_centers,
    point_index,
    size,
  };
}

export function compute_borders(buffer) {
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

    let a = [coords[v++], coords[v++]];

    for (let j = 1; j < len; j += 1) {
      const b = [coords[v++], coords[v++]];

      vertices.push(...a, ...b);

      a = b;
    }
  }

  return new Float32Array(vertices);
}
