precision mediump float;

varying vec2 v_position;
varying float v_fromChina;

void main() {
  if (v_position.x == 0. && v_position.y == 0.) {
    gl_FragColor = vec4(0, 1, 0, 1.);
    return;
  }
  if (v_fromChina == 1.) {
    gl_FragColor = vec4(0, 0, 1, 1);
    return;
  }
  gl_FragColor = vec4(1, 0, 0, 1.);
}
