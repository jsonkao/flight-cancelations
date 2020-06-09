import { compute_vertices, compute_geojson } from './vertices';

const base =
  'https://static01.nyt.com/newsgraphics/2020/02/04/coronavirus-flights/67d5b188d41684d2a82da11e94e358b4a769735e';

async function main() {
  const res = await fetch(`${base}/geometry/borders.dat`);
  const buf = await res.arrayBuffer();

  const vertices = compute_vertices(buf);
}

function treasure(buffer) {
  console.log(new Uint32Array(buffer, 0, 5));
}

async function test() {
  const res = await fetch(`${base}/20200123.dat`);
  const buf = await res.arrayBuffer();

  treasure(buf);
}

test().catch(console.error);
