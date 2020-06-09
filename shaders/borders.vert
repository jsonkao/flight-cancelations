precision mediump float;

attribute vec2 position;

void main() {
  gl_PointSize = 3.;
  gl_Position = vec4(position, 0, 1);
}
