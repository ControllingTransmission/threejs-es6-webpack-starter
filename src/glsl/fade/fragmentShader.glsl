uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec3 startColor;
uniform vec3 endColor;
// uniform float thickness;
float thickness = 2.0;
float distance = thickness * 20.0;
varying float vOpacity;
// varying vec3 vUv;
// Common varyings
varying vec3 v_position;
varying vec3 v_normal;


/*
 *  Calculates the normal vector at the given position
 *
 *  Uses this fix for some mobiles:
 *  https://stackoverflow.com/questions/20272272/standard-derivatives-from-fragment-shader-dfdx-dfdy-dont-run-correctly-in-a
 */
vec3 calculateNormal(vec3 position) {
    vec3 fdx = vec3(dFdx(position.x), dFdx(position.y), dFdx(position.z));
    vec3 fdy = vec3(dFdy(position.x), dFdy(position.y), dFdy(position.z));
    vec3 normal = normalize(cross(fdx, fdy));

    if (!gl_FrontFacing) {
        normal = -normal;
    }

    return normal;
}

/*
 *  Calculates the diffuse factor produced by the light illumination
 */
float diffuseFactor(vec3 normal, vec3 light_direction) {
    float df = dot(normalize(normal), normalize(light_direction));

    if (gl_FrontFacing) {
        df = -df;
    }

    return max(0.0, df);
}

void main() {
  // Calculate the new normal vector
  vec3 new_normal = calculateNormal(v_position);

  float min_resolution = min(u_resolution.x, u_resolution.y);
  vec3 light_direction = -vec3((u_mouse - 0.5 * u_resolution) / min_resolution, 0.25);

  // Set the surface color
  vec3 surface_color = vec3(1.0);
  // vec3 surface_color = mix(startColor, endColor, sin(u_time));

  // Apply the light diffusion factor
  surface_color *= diffuseFactor(new_normal, light_direction);

  gl_FragColor = vec4(surface_color, 1.0);
}