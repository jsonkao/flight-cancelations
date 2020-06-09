#define PI 3.1415926538

precision mediump float;

uniform sampler2D texture;

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
    discard;
  } else if (hyp_squared > 0.996) {
    gl_FragColor = vec4(1, 0, 0, 1);
    return;
  }

  // 2. Determine front-facing spherical coordinate

  float x = sqrt(1. - hyp_squared); // Ignore negative value (back face)
  float lambda = atan(y / x);
  float phi = acos(z);

  // 3. Convert long-lat radians to long-lat and grab the texture color

  float longitude = lambda / PI + 0.5;
  float latitude = phi / PI;
  vec4 texture_color = texture2D(texture, vec2(longitude, latitude));

  // Lastly, set the color

  gl_FragColor = texture_color;
}
