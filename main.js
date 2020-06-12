import createREGL from 'regl';
import { compute_borders, compute_flight_paths } from './vertices';

import flightsFrag from './shaders/flights.frag';
import flightsVert from './shaders/flights.vert';
import bordersFrag from './shaders/borders.frag';
import bordersVert from './shaders/borders.vert';
import textureFrag from './shaders/texture.frag';
import textureVert from './shaders/texture.vert';

import specImg from './specularity@2x.png';
import monoImg from './mono@2x.png';
import planeImg from './airplane.png';
import borderData from './borders.dat';
import flightData from './20200123.dat';

const regl = createREGL();

const base =
  'https://static01.nyt.com/newsgraphics/2020/02/04/coronavirus-flights/67d5b188d41684d2a82da11e94e358b4a769735e';

async function getBorders() {
  return fetch(`./${borderData}`)
    .then(response => response.arrayBuffer())
    .then(buffer => compute_borders(buffer));
}

async function getTexture(filename) {
  return new Promise(resolve => {
    const image = new Image();
    image.src = filename; // `${base}/textures/${filename}`;
    image.crossOrigin = '';
    image.onload = () => resolve(regl.texture({ data: image, flipY: true }));
  });
}

async function getFlights() {
  return fetch(`./${flightData}`)
    .then(response => response.arrayBuffer())
    .then(buffer => compute_flight_paths(buffer));
}

const longitude_offset = regl.prop('longitude_offset');

function createLineDrawer(vertices) {
  return regl({
    frag: bordersFrag,
    vert: bordersVert,

    uniforms: {
      aspectRatio,
      longitude_offset,
    },

    blend: {
      enable: true,
      func: {
        src: 'src alpha',
        dst: 'one minus src alpha',
      },
    },
    depth: { enable: false },
    attributes: { position: vertices },

    count: vertices.length / 2,
    primitive: 'lines',
  });
}

// const light_reversed = [-0.5, 0.5, 1];
// const light_mag = Math.hypot(...light_reversed);

async function main() {
  const [
    borders,
    flights,
    landTexture,
    monoTexture,
    planeTexture,
  ] = await Promise.all([
    getBorders(),
    getFlights(),
    getTexture(specImg), // 'specularity@2x.png'
    getTexture(monoImg), // 'mono@2x.png'
    getTexture(planeImg),
  ]);

  const drawBorders = createLineDrawer(borders);

  const drawFlights = regl({
    frag: flightsFrag,
    vert: flightsVert,

    uniforms: {
      planeTexture,
      longitude_offset,
      elapsed: regl.prop('elapsed'),
      aspectRatio,

      speed: 0.0003,
      size: 0.03, // Also equals 2/3 * altitude because we're at centroid
    },

    attributes: flights,

    blend: {
      enable: true,
      func: {
        src: 'src alpha',
        dst: 'one minus src alpha',
      },
    },
    depth: { enable: false },

    count: flights.a_depart_center.length / 3,
    primitive: 'triangles',
  });

  const drawTexture = regl({
    frag: textureFrag,
    vert: textureVert,

    uniforms: {
      landTexture,
      monoTexture,
      aspectRatio,
      longitude_offset,
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

  regl.frame(({ time }) => {
    // const longitude_offset = time / 4;
    let longitude_offset = 3;

    drawTexture({ longitude_offset });
    drawBorders({ longitude_offset });
    drawFlights({ longitude_offset, elapsed: time * 1000 });
  });
}

main().catch(console.error);

function aspectRatio({ viewportWidth, viewportHeight }) {
  const ar = viewportWidth / viewportHeight;
  return ar > 1 ? [ar, 1] : [1, 1 / ar];
}
