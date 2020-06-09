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

async function getImage() {
  return new Promise(resolve => {
    const image = new Image();
    image.src = `${base}/textures/specularity@2x.png`;
    image.crossOrigin = '';
    image.onload = () => resolve(image);
  });
}

async function main() {
  const [vertices, image] = await Promise.all([getVertices(), getImage()]);

  const drawBorders = regl({
    frag: borderFrag,
    vert: borderVert,
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
      texture: regl.texture({ data: image }),
      tick: regl.prop('tick'),
    },
    attributes: {
      // Two triangles that cover the whole clip space
      position: regl.buffer([
        [-1, 1],
        [1, -1],
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ]),
    },

    count: 6,
  });

  regl.frame(({ tick }) => {
    regl.clear({
      color: [0, 0, 0, 0],
      depth: 1,
    });
    drawBorders();
    drawTexture({ tick });
  });
}

async function test() {
  const res = await fetch(`${base}/20200123.dat`);
  const buf = await res.arrayBuffer();

  console.log(new Uint16Array(buf));
}

main().catch(console.error);
