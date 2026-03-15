varying vec3 vPosition;
uniform sampler2D uTexture;
uniform sampler2D uTexture2;

varying vec2 vUv;
void main() {
        vUv = uv;
    vec3 OG = texture2D(uTexture, uv).rgb;
    // scale from 0-1 to 0-255
    OG = OG * 255.0;
    float height = -10000.0 + ((OG.r * 255.0 * 255.0 + OG.g * 255.0 + OG.b) * 0.1);

    //POINT OF ERROR
    height = height * 0.0003;
    // Modify the vertex position based on the height
    vec3 modifiedPosition = position;
    modifiedPosition.z += height; 
    
    // Transform the modified position
    vec4 modelPosition = modelMatrix * vec4(modifiedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    vPosition = position;

}