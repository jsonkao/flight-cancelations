#pragma glslify: project = require(./project)

#define PI 3.1415926538

precision mediump float;

uniform vec2 aspectRatio;
uniform float longitude_offset;

uniform float elapsed;
uniform float speed;
uniform float size;

// attribute vec2 a_depart_point;
// attribute vec2 a_arrive_point;
attribute vec2 a_depart_center;
attribute vec2 a_arrive_center;
attribute float point_index;

varying vec2 v_position;

mat2 rotate2d(float _angle) {
  return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
}

vec2 project_with_offset(vec2 point) {
  return project(point, longitude_offset);
}

void main() {
  vec2 depart_center = project_with_offset(a_depart_center);
  vec2 arrive_center = project_with_offset(a_arrive_center);

  vec2 span = arrive_center - depart_center;
  float angle = atan(span.y, span.x);

  float theta = angle - point_index * (2. / 3.) * PI;
  vec2 delta = size * vec2(cos(theta), sin(theta));

  vec2 depart_point = depart_center + delta;
  vec2 arrive_point = arrive_center + delta;

  float travel_time = distance(depart_center, arrive_center) / speed;
  float t = mod(elapsed / travel_time, 1.);

  vec2 position = mix(depart_point, arrive_point, t);
  vec2 center = mix(depart_center, arrive_center, t);

  // 1. Center triangle at the origin

  v_position = position - center;

  // 2. Rotate so that the triangle points up

  float desired_angle = PI / 2.;
  v_position *= rotate2d(desired_angle - angle);

  // 3. Shrink triangle by SIZE. The result is a triangle with altitude =
  // 1 + 1/2 and a side length of √3. We want a side length of 1, so we shrink
  // the triangle again by √3.

  v_position /= size * sqrt(3.);

  // 4, Now just place triangle bottom left tip at (0, 0)

  v_position += vec2(0.5, sqrt(3.) / 6.);

  gl_Position = vec4(position / aspectRatio, 0, 1);
}
