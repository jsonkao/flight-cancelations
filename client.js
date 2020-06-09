import createREGL from 'regl';
import { compute_vertices } from './vertices';

import borderFrag from './shaders/borders.frag';
import borderVert from './shaders/borders.vert';
import textureFrag from './shaders/texture.frag';
import textureVert from './shaders/texture.vert';

const regl = createREGL();

const base =
  'https://static01.nyt.com/newsgraphics/2020/02/04/coronavirus-flights/67d5b188d41684d2a82da11e94e358b4a769735e';

async function getVertices() {
  return fetch(`${base}/geometry/borders.dat`)
    .then(response => response.arrayBuffer())
    .then(buffer => compute_vertices(buffer));
}

async function getBitmap() {
  return fetch(`${base}/textures/specularity@2x.png`)
    .then(response => response.blob())
    .then(blob => createImageBitmap(blob));
}

async function main() {
  const [vertices, bitmap] = await Promise.all([getVertices(), getBitmap()]);
  const texture = regl.texture(bitmap);

  const drawBorders = regl({
    frag: borderFrag,
    vert: borderVert,

    uniforms: {
      pointWidth: 3,
      time: regl.prop('time'),
    },
    attributes: {
      position: vertices,
    },

    count: vertices.length / 2,
    primitive: 'points',
  });

  const drawTexture = regl({
    frag: textureFrag,
    vert: textureVert,

    uniforms: {
      texture,
    },
    attributes: {
      position: [-2, 0, 0, -2, 2, 2],
    },

    count: 3,
  });

  drawTexture();
}

async function test() {
  const res = await fetch(`${base}/20200123.dat`);
  const buf = await res.arrayBuffer();

  console.log(new Uint16Array(buf));
}

main().catch(console.error);
