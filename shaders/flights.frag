precision mediump float;

uniform sampler2D plane_texture;

varying vec2 v_position;

void main() {

  // Goal: Get position in texture space (0, 0) -> (1, 1)

  vec2 position = v_position;
  position.y += 0.13;
  vec4 texture_color = texture2D(plane_texture, position);

  // if (texture_color.a == 0.) {
    // discard; 
  // }

  gl_FragColor = vec4(0.67, 0.02, 0.31, texture_color.a);
}

