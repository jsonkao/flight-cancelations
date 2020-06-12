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

vec3 project(vec2 point) { return project(point, longitude_offset); }

float hav(float theta) { return pow(sin(theta / 2.), 2.); }

// Calculates great-circle distance between two spherical points given their
// longitudes and latitudes
float haversine_distance() {
  vec2 depart_rad = a_depart_center * (PI / 180.);
  vec2 arrive_rad = a_arrive_center * (PI / 180.);
  vec2 delta = arrive_rad - depart_rad;

  float haversine =
      hav(delta[1]) + cos(depart_rad[1]) * cos(arrive_rad[1]) * hav(delta[0]);

  return 2. * asin(sqrt(haversine));
}

void main() {
  float t = mod(speed * elapsed / haversine_distance(), 1.);

  vec2 long_lat = mix(a_depart_center, a_arrive_center, t);
  vec3 position = project(long_lat);
  vec3 next_position =
      project(long_lat + (a_arrive_center - a_depart_center) * .001);

  vec3 span = next_position - position;
  float angle = atan(span.y, span.x);

  float theta = angle - point_index * (2. / 3.) * PI;
  vec2 delta = vec2(cos(theta), sin(theta));

  vec3 vertex_position = project(long_lat + size * delta);

  v_depth = position.z;

  v_position = delta;

  // 1. Rotate so that the triangle points up

  float desired_angle = PI / 2.;
  v_position *= rotate2d(desired_angle - angle);

  // 2. Right now we have a triangle with altitude = 1 + 1/2
  // a side length of √3. We want a side length of 1, so we shrink
  // the triangle again by √3.

  v_position /= sqrt(3.);

  // 3, Now just place triangle bottom left tip at (0, 0)

  v_position += vec2(0.5, sqrt(3.) / 6.);

  gl_Position = vec4(vertex_position.xy / aspectRatio, 0, 1);
}
