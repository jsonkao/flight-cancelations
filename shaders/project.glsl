#define PI 3.1415926538

precision mediump float;

vec2 project(vec2 point) {
  vec2 point_radians = point * PI / 180.;
  float lon = point_radians[0];
  float lat = point_radians[1];

  float azimuth = lon - PI / 2.;
  float inclination = PI / 2. - lat;

  float y = sin(inclination) * sin(azimuth);
  float z = cos(inclination);

  return vec2(y, z);
}

#pragma glslify: export(project)
