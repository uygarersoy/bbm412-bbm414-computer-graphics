precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uLightColor;
uniform float uLightIntensity;

in vec3 vPosition;

out vec4 fragColor;

void main() {
    if (uLightIntensity <= 0.0) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
    else {
        float heightFactor = (vPosition.z + 1.0) * 0.5;
        float pulsate = 0.5 + 0.5 * sin(uTime * 2.0);
        vec3 colorGradient = mix(uColor, uLightColor, heightFactor * pulsate);
        fragColor = vec4(colorGradient, 1.0);
    }
}