precision mediump float;
attribute vec2 position;
uniform float pointWidth;

void main() {
  gl_PointSize = pointWidth;
  gl_Position = vec4(position, 0, 1);
}
