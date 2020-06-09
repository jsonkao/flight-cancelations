precision mediump float;

uniform sampler2D texture;

varying vec2 uv;

void main() {
  // set color
  gl_FragColor = texture2D(texture, uv);
}
