#pragma glslify: project = require(./project)

precision mediump float;

uniform vec2 aspectRatio;
uniform float longitude_offset;

attribute vec2 position;

varying float v_is_facing;

void main() {
  vec2 projected_position = project(position, longitude_offset);

  // is 1 if projected position is in front facing hemisphere
  v_is_facing = step(-1., projected_position.x);

  gl_Position = vec4(projected_position / aspectRatio, 0, 1);
}
