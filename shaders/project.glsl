precision mediump float;

#define PI 3.1415926538

vec2 project(vec2 point, float longitude_offset) {
  point *= PI / 180.;
  float lon = point[0];
  float lat = point[1];

  float azimuth = lon - longitude_offset;
  float inclination = PI / 2. - lat;

  float depth = sin(inclination) * cos(azimuth);
  float x = sin(inclination) * sin(azimuth);
  float y = cos(inclination);

  float is_behind = 1. - step(0., depth);

  // if hemisphere is behind, return -2
  return vec2((1. - is_behind) * x + is_behind * -2., y);
}

#pragma glslify: export(project)
