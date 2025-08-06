varying vec3 vPosition;
uniform sampler2D uTexture;
uniform sampler2D uTexture2;

varying vec2 vUv;
void main() {
    vec3 color = vec3(1.0);
    vec3 OG = texture2D(uTexture2, vUv).rgb;
    gl_FragColor = vec4(OG,1.0);
}