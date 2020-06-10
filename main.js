import createREGL from 'regl';
import { compute_vertices, compute_flight_paths } from './vertices';
import airports from './airports.json';

import pointsFrag from './shaders/points.frag';
import pointsVert from './shaders/points.vert';
import borderFrag from './shaders/borders.frag';
import borderVert from './shaders/borders.vert';
import textureFrag from './shaders/texture.frag';
import textureVert from './shaders/texture.vert';

import spec from './specularity@2x.png';
import mono from './mono@2x.png';

const regl = createREGL();

const base =
  'https://static01.nyt.com/newsgraphics/2020/02/04/coronavirus-flights/67d5b188d41684d2a82da11e94e358b4a769735e';

async function getVertices() {
  return fetch(`${base}/geometry/borders.dat`)
    .then(response => response.arrayBuffer())
    .then(buffer => compute_vertices(buffer));
}

async function getTexture(filename) {
  return new Promise(resolve => {
    const image = new Image();
    // image.src = `${base}/textures/${filename}`;
    image.src = filename;
    image.crossOrigin = '';
    image.onload = () => resolve(regl.texture({ data: image, flipY: true }));
  });
}

function createLineDrawer(vertices) {
  return regl({
    frag: borderFrag,
    vert: borderVert,

    uniforms: { aspectRatio, },

    attributes: { position: vertices },

    count: vertices.length / 2,
    primitive: 'lines',
  });
}

async function main() {
  const [borders, landTexture, monoTexture, flights] = await Promise.all([
    getVertices(),
    // getTexture('specularity@2x.png'),
    // getTexture('mono@2x.png'),
    getTexture(spec),
    getTexture(mono),
    getFlights(),
  ]);

  const drawBorders = createLineDrawer(borders);

  const drawFlights = regl({
    frag: pointsFrag,
    vert: pointsVert,

    uniforms: { aspectRatio, },

    attributes: { position: flights, fromChina: flights.map((_, i) => airports[i % airports.length][2]) },

    count: flights.length / 2,
    primitive: 'points',
  })

  const drawTexture = regl({
    frag: textureFrag,
    vert: textureVert,

    uniforms: {
      landTexture,
      monoTexture,
      tick: regl.prop('tick'),
      aspectRatio,
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
    drawFlights();
    drawTexture({ tick });
  });
}

async function getFlights() {
  return fetch(`${base}/20200123.dat`)
    .then(response => response.arrayBuffer())
    .then(buffer => compute_flight_paths(buffer));
}

main().catch(console.error);

function aspectRatio({ viewportWidth, viewportHeight }) {
  const ar = viewportWidth / viewportHeight;
  return ar > 1 ? [ar, 1] : [1, 1 / ar];
}
