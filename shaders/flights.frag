precision mediump float;

uniform sampler2D planeTexture;
uniform sampler2D planeShadowTexture;

varying vec2 v_position;
varying float v_depth;

void main() {
  if (v_depth < 0.) {
    discard;
  }

  vec2 position = v_position;

  // Scale a bit relative to (0.5, 0.5) (the center of the image)
  position = 1.15 * (position - vec2(0.5)) + vec2(0.5);

  // Final adjustments since there's some padding on airplane.png
  position.y += 0.2;

  float plane_alpha = texture2D(planeTexture, position).a;
  vec4 shadow_color = texture2D(planeShadowTexture, position + 0.1);

  vec4 plane_color = vec4(0.67, 0.02, 0.31, plane_alpha);

  vec4 color = mix(plane_color, shadow_color, 1. - plane_alpha);

  gl_FragColor = vec4(color);
}
