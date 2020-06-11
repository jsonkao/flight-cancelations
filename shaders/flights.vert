precision mediump float;
#define PI 3.1415926538
uniform sampler2D plane_texture;
uniform vec2 aspectRatio;

uniform float elapsed;
uniform float speed;

attribute vec2 depart_point;
attribute vec2 arrive_point;

attribute float point_index;

// TODO: remove since we have point_index
attribute vec2 depart_center;
attribute vec2 arrive_center;

varying vec2 v_position;
varying vec2 v_position_adj;
varying vec2 v_center;
varying float v_point_index;

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void main() {
  float travel_time = distance(depart_point, arrive_point) / speed;
  float t = mod(elapsed / travel_time, 1.);
  t = 0.;

  vec2 position = mix(depart_point, arrive_point, t);
  vec2 center = mix(depart_center, arrive_center, t);

  v_position = position;
  v_position_adj = position - center;
  float angle = atan(v_position.y, v_position.x) - v_point_index * (2. / 3.) * PI;
  // v_position *= rotate2d(-angle);
  v_center = center;
  v_point_index = point_index;

  gl_Position = vec4(position / aspectRatio, 0, 1);
  // gl_Position = vec4(depart_point / aspectRatio, 0, 1);
}
