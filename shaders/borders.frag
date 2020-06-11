precision mediump float;

varying float v_depth;

void main() {
  // v_depth is less than 1 when one vertex has a depth < 0.
  // Doing < 1 not == 0 because varyings are interpolated
  if (v_depth < 1.) {
    discard;
  }

  gl_FragColor = vec4(vec3(230. / 255.), 1.);
}
