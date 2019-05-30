attribute float vertexDisplacement;
uniform float delta;
varying float vOpacity;
varying vec3 vUv;
varying vec3 v_position;
varying vec3 v_normal;

void main() {
    // Save the varyings
    v_position = position;
    v_normal = normalize(normalMatrix * normal);

    vUv = position;
    vOpacity = vertexDisplacement;

    vec3 p = position;

    p.x += sin(vertexDisplacement) * 50.0;
    p.y += cos(vertexDisplacement) * 50.0;

    vec4 modelViewPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
}
