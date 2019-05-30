uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 skyboxStartColor;
uniform vec3 skyboxEndColor;
uniform vec3 skyboxLineColor;
uniform float skyboxColorIntensity;
// uniform float thickness;
float thickness = 2.0;
float distance = thickness * 20.0;


varying float vOpacity;
// varying vec3 vUv;
// Common varyings
varying vec3 v_position;
varying vec3 v_normal;


void main() {
  // float delta = 0.5 + sin(u_time) * 0.5;
  // float r = 1.0 + cos(vUv.x * delta);
  // float g = 0.5 + sin(delta) * 0.5;
  // float b = 0.0;
  // vec3 rgb = vec3(0.2, 0.2, 0.2);

  // if (mod(v_position.y, 30.0) == 0.0) {
  //   gl_FragColor = vec4(0.8, 0.8, 0.8, vOpacity);
  // }
  // else {
  //   gl_FragColor = vec4(0.8, 0.0, 0.0, vOpacity);
  // }

  // gl_FragColor = vec4(rgb, vOpacity);
  vec3 color = mix(vec3(1.0, 1.0, 1.0),
    mix(skyboxStartColor, skyboxEndColor, (v_position.x + 750.0) / 1500.0),
    skyboxColorIntensity);

  if (mod(floor(v_position.x / thickness), floor(distance)) == 0.0 ||
      mod(floor(v_position.y / thickness), floor(distance)) == 0.0 ||
      mod(floor(v_position.z / thickness), floor(distance)) == 0.0) {
    color = mix(vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), skyboxColorIntensity);
  }

  // gl_FragColor = vec4(
  //   mod(v_position.x / thickness, thickness),
  //   mod(v_position.y / thickness, thickness),
  //   mod(v_position.z / thickness, thickness),
  //   vOpacity);
  gl_FragColor = vec4(color, 1.0);
}