#define PI 3.1415926538

precision mediump float;

uniform sampler2D landTexture;
uniform sampler2D monoTexture;
uniform float tick;

varying vec2 v_position;

vec3 LIGHT_REVERSED = vec3(-0.5, 0.5, 1);
float LIGHT_MAG = distance(LIGHT_REVERSED, vec3(0));

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
  }

  // 2. Determine front-facing spherical coordinate

  float lambda_offset = tick / 400.;

  float x = sqrt(1. - hyp_squared); // Take positive face
  float lambda = atan(y / x) + PI;       // [-PI / 2, PI / 2]
  float phi = PI / 2. - acos(z);    // [-PI / 2, PI / 2]

  // 3. Convert long-lat radians to long-lat

  float longitude = (lambda + PI) / (2. * PI); // map to [0, 0.5]
  float latitude = phi / PI + 0.5;             // map to [0, 1]

  // 3.5. Draw lat/lng lines

  // if (mod(longitude, PI / 360.) < 0.001) {
  //   gl_FragColor = vec4(0, 0, 0, 0.3);
  //   return;
  // }

  // 4. Grab the texture color and do some color stuffs. Black = land, white =
  // no land.

  vec2 longlat = vec2(mod(longitude, 1.), mod(latitude, 1.));
  vec3 texture_color = texture2D(landTexture, longlat).rgb;
  vec3 mono_color = texture2D(monoTexture, longlat).rgb;

  texture_color += vec3(240. / 255.) * mono_color;

  // 5. Calculate lighting. Allow it to only impact a little bit.

  float dotted = dot(vec3(y, z, x), LIGHT_REVERSED) / LIGHT_MAG;
  float light = sign(dotted) * pow(dotted, 1.2);
  light = min(1.0, 0.55 + light * 0.3);

  gl_FragColor = vec4(texture_color, 1.);
  gl_FragColor.rgb *= light;
}
