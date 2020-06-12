#define PI 3.1415926538

vec3 project(vec2 point, float longitude_offset) {
  point *= PI / 180.;
  float lon = point[0];
  float lat = point[1];

  float azimuth = lon - longitude_offset;
  float inclination = PI / 2. - lat;

  float depth = sin(inclination) * cos(azimuth);
  float x = sin(inclination) * sin(azimuth);
  float y = cos(inclination);

  return vec3(x, y, depth);
}

precision mediump float;

uniform vec2 aspectRatio;
uniform float longitude_offset;

uniform float elapsed;
uniform float speed;
uniform float size;

attribute vec2 a_depart_center;
attribute vec2 a_arrive_center;
attribute float point_index;

varying vec2 v_position;
varying float v_depth;

mat2 rotate2d(float _angle) {
  return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
}

vec3 project_with_offset(vec2 point) {
  return project(point, longitude_offset);
}

float great_circle_distance(vec3 a, vec3 b) { return acos(dot(a, b)); }

void main() {
  vec3 depart_center = project_with_offset(a_depart_center);
  vec3 arrive_center = project_with_offset(a_arrive_center);

  vec3 span = arrive_center - depart_center;
  float angle = atan(span.y, span.x);
  float theta = angle - point_index * (2. / 3.) * PI;

  vec3 delta = size * vec3(cos(theta), sin(theta), 0);

  float travel_time =
      great_circle_distance(depart_center, arrive_center) / speed;
  float t = mod(elapsed / travel_time, 1.);

  vec3 center = project_with_offset(mix(a_depart_center, a_arrive_center, t));
  vec3 position = center + delta;

  v_depth = center.z;

  // 1. Center triangle at the origin

  v_position = delta.xy;

  // 2. Rotate so that the triangle points up

  float desired_angle = PI / 2.;
  v_position *= rotate2d(desired_angle - angle);

  // 3. Shrink triangle by SIZE. The result is a triangle with altitude =
  // 1 + 1/2 and a side length of √3. We want a side length of 1, so we shrink
  // the triangle again by √3.

  v_position /= size * sqrt(3.);

  // 4, Now just place triangle bottom left tip at (0, 0)

  v_position += vec2(0.5, sqrt(3.) / 6.);

  gl_Position = vec4(position.xy / aspectRatio, 0, 1);
}
