#define PI 3.1415926538

precision mediump float;

uniform vec2 aspectRatio;

uniform float elapsed;
uniform float speed;

uniform float size;

attribute vec2 depart_point;
attribute vec2 arrive_point;

attribute float point_index;

// TODO: remove since we have point_index
attribute vec2 depart_center;
attribute vec2 arrive_center;

varying vec2 v_position;

mat2 rotate2d(float _angle) {
  return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
}

void main() {
  float travel_time = distance(depart_point, arrive_point) / speed;
  float t = mod(elapsed / travel_time, 1.);

  vec2 position = mix(depart_point, arrive_point, t);
  vec2 center = mix(depart_center, arrive_center, t);

  // 1. Center triangle at the origin

  v_position = position - center;

  // 2. Rotate so that the triangle points up

  vec2 span = arrive_point - depart_point;
  float angle = atan(span.y, span.x);
  float desired_angle = PI / 2.;
  v_position *= rotate2d(desired_angle - angle);

  // 3. Shrink triangle by SIZE. The result is a triangle with altitude =
  // 1 + 1/2 and a side length of √3. We want a side length of 1, so we shrink
  // the triangle again by √3.

  v_position /= size;
  v_position /= sqrt(3.);

  // 4, Now just place triangle bottom left tip at (0, 0)

  v_position += vec2(0.5, sqrt(3.) / 6.);

  // 5. Ensure plane fits somehow

  gl_Position = vec4(position / aspectRatio, 0, 1);
  // gl_Position = vec4(depart_point / aspectRatio, 0, 1);
}
