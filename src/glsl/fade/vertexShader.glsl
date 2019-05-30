attribute float vertexDisplacement;
uniform vec2 u_resolution;
uniform float delta;
varying float vOpacity;
varying vec3 vUv;
varying vec3 v_position;
varying vec3 v_normal;

void main() {
    // Save the varyings
    v_position = position;
    v_normal = normalize(normalMatrix * normal);

    // Vertex shader output
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
