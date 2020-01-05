precision mediump float;

uniform sampler2D texture_colorbar_sampler; 

varying float vtexture_coordinate;

void main(void) {
    gl_FragColor = texture2D(texture_colorbar_sampler, vec2(0.5,vtexture_coordinate/255.0));
}