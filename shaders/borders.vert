#pragma glslify: project = require(./project)

precision mediump float;

uniform vec2 aspectRatio;

attribute vec2 position;

void main() {
  gl_Position = vec4(project(position) / aspectRatio, 0, 1);
}
