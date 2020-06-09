precision mediump float;

uniform float time;

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void main() {
  // rotate2d(sin(time) * PI)
  gl_FragColor = vec4(1, 0, 0, 1);
}
