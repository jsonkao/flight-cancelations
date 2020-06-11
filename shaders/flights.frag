precision mediump float;

uniform sampler2D plane_texture;

varying vec2 v_position;

void main() {
  vec2 position = v_position;

  // Scale a bit relative to (0.5, 0.5) (the center of the image)
  position -= vec2(0.5);
  position *= 1.15;
  position += vec2(0.5);

  // Final adjustments since there's some padding on airplane.png
  position.y += 0.2;

  vec4 texture_color = texture2D(plane_texture, position);

  gl_FragColor = vec4(0.67, 0.02, 0.31, texture_color.a);
  // gl_FragColor = vec4(0.67, 0.02, 0.31, 1);
  // gl_FragColor.rgb *= texture_color.a;
}
