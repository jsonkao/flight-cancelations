import createREGL from 'regl';
import { compute_vertices } from './vertices';

import frag from './shaders/borders.frag';
import vert from './shaders/borders.vert';

const regl = createREGL();

const base =
  'https://static01.nyt.com/newsgraphics/2020/02/04/coronavirus-flights/67d5b188d41684d2a82da11e94e358b4a769735e';

async function getVertices() {
  const res = await fetch(`${base}/geometry/borders.dat`);
  const buf = await res.arrayBuffer();
  const vertices = compute_vertices(buf);
  return vertices;
}

async function main() {
  const vertices = await getVertices();

  const draw = regl({
    frag,
    vert,

    uniforms: {
      pointWidth: 4,
      time: regl.prop('time'),
    },

    attributes: {
      position: vertices,
    },

    count: vertices.length / 2,
    primitive: 'points',
  });

  regl.frame(({time}) => {
    // clear contents of the drawing buffer
    regl.clear({
      color: [0, 0, 0, 0],
      depth: 1
    })

    // draw a triangle using the command defined above
    draw({
      time
    })
  })
}

async function test() {
  const res = await fetch(`${base}/20200123.dat`);
  const buf = await res.arrayBuffer();

  console.log(new Uint16Array(buf));
}

test();

main().catch(console.error);
