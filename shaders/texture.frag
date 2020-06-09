#define PI 3.1415926538

precision mediump float;

uniform sampler2D landTexture;
uniform sampler2D monoTexture;
uniform float tick;

varying vec2 v_position;

void main() {

  // Right now, we have v_position in [-1, 1] x [-1, 1]. Each fragment is
  // a point on the sphere. We have to figure out the long-lat from that point
  // to find the correct texture position.
  // First we take Cartesian coordinates.

  float y = v_position.x;
  float z = v_position.y;
  float hyp_squared = y * y + z * z;

  // 1. Discard points outside the sphere

  if (sqrt(hyp_squared) > 1.) {
    gl_FragColor = vec4(0, 0, 0, 0.04);
    return;
  }

  // 2. Determine front-facing spherical coordinate

  float lambda_offset = tick / 400.;

  float x = sqrt(1. - hyp_squared);           // Take positive face
  float lambda = atan(y / x) + lambda_offset; // [-PI / 2, PI / 2]
  float phi = acos(z);                        // [0, PI]

  // 3. Convert long-lat radians to long-lat

  float longitude = (lambda + PI) / (2. * PI);
  float latitude = phi / PI;

  // 3.5. Draw lat/lng lines

  // if (mod(longitude, PI / 360.) < 0.001) {
  // gl_FragColor = vec4(0, 0, 0, 0.3);
  // return;
  // }

  // 4. Grab the texture color and do some color stuffs. Black = land, white =
  // no land.

  vec2 longlat = vec2(mod(longitude, 1.), mod(latitude, 1.));
  vec3 texture_color = texture2D(landTexture, longlat).rgb;
  vec3 mono_color = texture2D(monoTexture, longlat).rgb;

  texture_color += vec3(228. / 255.) * mono_color;

  gl_FragColor = vec4(texture_color, 1.);
}
