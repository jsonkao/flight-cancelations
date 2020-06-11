#define PI 3.1415926538

precision mediump float;

varying vec2 v_position;
varying vec2 v_position_adj;
varying vec2 v_center;
varying float v_point_index;

mat2 rotate2d(float _angle) {
  return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
}

float SIZE = 0.05;

void main() {

  // Goal: Get position in texture space (0, 0) -> (1, 1)

  vec2 position = v_position;

  // 1. Translate by negative center
  position -= v_center;
  // 2. Rotate by negative angle
  float angle = atan(position.y, position.x) - v_point_index * (2. / 3.) * PI;
  position *= rotate2d(-angle);
  // 3. Scale by 1 / SIZE
  position /= SIZE;
  // 4. Translate up so baseline is 0
  // position += vec2(SIZE * sqrt(1. / 3.), SIZE / 2.);

  // gl_FragColor = vec4(floor(v_point_index + 0.5) / 2., 0, 0, 1.);
  
  // same result as using position-adj
  gl_FragColor = vec4((v_position - v_center).x * 20., -(v_position - v_center).x * 10., 0, 1);
}
