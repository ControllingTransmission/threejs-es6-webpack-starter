#define GLSLIFY 1
// Common uniforms
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float wiggleIntensityX;
uniform float wiggleIntensityY;
uniform float u_time;
uniform float u_frame;

// Common varyings
varying vec3 v_position;
varying vec3 v_normal;

/*
 * The main program
 */
void main() {
  // Calculate the new vertex position to simulate a wave effect
  // float effect_intensity = 2.0 * u_mouse.x / u_resolution.x;
  vec3 new_position = position + wiggleIntensityX * (0.5 + 0.5 * cos(position.x + 4.0 * u_time)) * normal;
  new_position = new_position + wiggleIntensityY * (0.5 + 0.5 * cos(position.y + 4.0 * u_time)) * normal;

  // Calculate the modelview position
  vec4 mv_position = modelViewMatrix * vec4(new_position, 1.0);

  // Save the varyings
  v_position = mv_position.xyz;
  v_normal = normalize(normalMatrix * normal);

  // Vertex shader output
  gl_Position = projectionMatrix * mv_position;
}