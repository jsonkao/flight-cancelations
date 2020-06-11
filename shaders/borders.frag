precision mediump float;

varying float v_is_facing;

void main() {
  // (< 1) not (== 0) because because varyings are interpolated
  if (v_is_facing < 1.) {
    discard;
  }

  gl_FragColor = vec4(vec3(230. / 255.), 1.);
}
