#pragma glslify: project = require(./project)

precision mediump float;

uniform vec2 aspectRatio;
uniform float longitude_offset;

attribute vec2 position;

varying float v_depth;

void main() {
  vec3 projected_position = project(position, longitude_offset);

  // 0 if negative, 1 if positive
  v_depth = step(0., projected_position.z);

  gl_Position = vec4(projected_position.xy / aspectRatio, 0, 1);
}
