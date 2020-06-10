precision mediump float;

uniform vec2 aspectRatio;

attribute vec2 position;
attribute float fromChina;

varying vec2 v_position;
varying float v_fromChina;

void main() {
  v_fromChina = fromChina;
  v_position = position;

  gl_PointSize = 5.;
  gl_Position = vec4(position / aspectRatio, 0, 1);
}
