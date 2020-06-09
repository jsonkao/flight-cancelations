#define PI 3.1415926538

precision mediump float;

uniform sampler2D texture;
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

  // 3. Convert long-lat radians to long-lat and grab the texture color

  float longitude = (lambda + PI) / (2. * PI);
  float latitude = phi / PI;
  vec3 texture_color =
      texture2D(texture, vec2(mod(longitude, 1.0), mod(latitude, 1.0))).rgb;

  // 4. Black = land, white = no land. Do some color stuffs

  texture_color += vec3(208. / 255.);

  gl_FragColor = vec4(texture_color, 1.);
}
