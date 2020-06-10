precision mediump float;

varying vec2 v_position;
varying float v_fromChina;

void main() {
  gl_FragColor = vec4(v_fromChina, v_fromChina, 0, 1.);
}
