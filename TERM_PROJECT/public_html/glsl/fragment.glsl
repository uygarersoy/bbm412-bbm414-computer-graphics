precision highp float;

uniform float uLightIntensity;
out vec4 fragColor;

void main() {
    if (uLightIntensity <= 0.0) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
    else {
        fragColor = vec4(0.0, 0.0, 1.0, 1.0);
    }
}