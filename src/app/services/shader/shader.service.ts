import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShaderService {

  /*=================== obst shaders =================== */

  vertCode_obst_lit = 'attribute vec3 position;' +
    'uniform mat4 Pmatrix;' +
    'uniform mat4 Vmatrix;' +
    'uniform mat4 Mmatrix;' +
    'uniform mat4 normal_matrix;' +
    'attribute vec3 color;' + //the color of the point
    'attribute vec3 normal;' +//the normal of the point
    'varying highp vec3 vcolor;' +
    'varying highp vec3 normalInterp;' +
    'varying highp vec3 vertPos;' +
    'void main(void) { ' +
    'vec4 vertPos4 = Vmatrix * Mmatrix * vec4(position, 1.0);' +
    'vertPos = vec3(vertPos4) / vertPos4.w;' +
    'normalInterp = vec3(normal_matrix * vec4(normal, 0.0));' +
    'vcolor = color;' +
    'gl_Position = Pmatrix * vertPos4;' +
    '}';

  fragCode_obst_lit = 'precision mediump float;' +
    'varying highp vec3 vcolor;' +
    'precision mediump float;' +
    'varying highp vec3 normalInterp;' +                // Surface normal
    'varying highp vec3 vertPos;' +                     // Vertex position
    'vec3  ambientColor=vec3(1.0, 1.0, 1.0);' +
    'vec3  diffuseColor=vec3(0.6, 0.6, 0.6);' +
    'vec3 specularColor=vec3(1.0, 1.0, 1.0);' +
    'vec3 lightPos=vec3(1.0,1.0,-1.0);' +         // Light position
    'float Ka=0.1;' +                             // Ambient reflection coefficient
    'float Kd=0.2;' +                             // Diffuse reflection coefficient
    'float Ks=0.1;' +                             // Specular reflection coefficient
    'float shininessVal=10.0;' +                  // Shininess
    'void main() {' +
    '  vec3 N = normalize(normalInterp);' +
    '  vec3 L = normalize(lightPos - vertPos);' +
    '  float lambertian = max(dot(N, L), 0.0);' +
    '  float specular = 0.0;' +
    '  if(lambertian > 0.0) {' +
    '    vec3 R = reflect(-L, N);' +              // Reflected light vector
    '    vec3 V = normalize(-vertPos);' +         // Vector to viewer
    '    float specAngle = max(dot(R, V), 0.0);' +
    '    specular = pow(specAngle, shininessVal);' +
    '  }' +
    '  gl_FragColor = vec4((1.0-Ka-Kd)*vcolor + Ka * ambientColor +' +
    '                      Kd * lambertian * diffuseColor +' +
    '                      Ks * specular * specularColor, 1.0);' +
    '}';

  /*=================== geom shaders =================== */

  vertCode_geom_lit = 'attribute vec3 position;' +
    'uniform mat4 Pmatrix;' +
    'uniform mat4 Vmatrix;' +
    'uniform mat4 Mmatrix;' +
    'uniform mat4 normal_matrix;' +
    'attribute vec3 color;' + //the color of the point
    'attribute vec3 normal;' +//the normal of the point
    'varying highp vec3 vcolor;' +
    'varying highp vec3 normalInterp;' +
    'varying highp vec3 vertPos;' +
    'void main(void) { ' +
    'vec4 vertPos4 = Vmatrix * Mmatrix * vec4(position, 1.0);' +
    'vertPos = vec3(vertPos4) / vertPos4.w;' +
    'normalInterp = vec3(normal_matrix * vec4(normal, 0.0));' +
    'vcolor = color;' +
    'gl_Position = Pmatrix * vertPos4;' +
    '}';

  fragCode_geom_lit = 'precision mediump float;' +
    'varying highp vec3 vcolor;' +
    'precision mediump float;' +
    'varying highp vec3 normalInterp;' +                // Surface normal
    'varying highp vec3 vertPos;' +                     // Vertex position
    'vec3  ambientColor=vec3(1.0, 1.0, 1.0);' +
    'vec3  diffuseColor=vec3(0.6, 0.6, 0.6);' +
    'vec3 specularColor=vec3(1.0, 1.0, 1.0);' +
    'vec3 lightPos=vec3(1.0,1.0,-1.0);' +         // Light position
    'float Ka=0.1;' +                             // Ambient reflection coefficient
    'float Kd=0.2;' +                             // Diffuse reflection coefficient
    'float Ks=0.1;' +                             // Specular reflection coefficient
    'float shininessVal=10.0;' +                  // Shininess
    'void main() {' +
    '  vec3 N = normalize(normalInterp);' +
    '  vec3 L = normalize(lightPos - vertPos);' +
    '  float lambertian = max(dot(N, L), 0.0);' +
    '  float specular = 0.0;' +
    '  if(lambertian > 0.0) {' +
    '    vec3 R = reflect(-L, N);' +              // Reflected light vector
    '    vec3 V = normalize(-vertPos);' +         // Vector to viewer
    '    float specAngle = max(dot(R, V), 0.0);' +
    '    specular = pow(specAngle, shininessVal);' +
    '  }' +
    '  gl_FragColor = vec4((1.0-Ka-Kd)*vcolor + Ka * ambientColor +' +
    '                      Kd * lambertian * diffuseColor +' +
    '                      Ks * specular * specularColor, 1.0);' +
    '}';

  /*=================== slice node file shaders =================== */

  vertCode_slice_node = 'attribute vec3 position;' +
    'uniform mat4 Pmatrix;' +
    'uniform mat4 Vmatrix;' +
    'uniform mat4 Mmatrix;' +
    'attribute float texture_coordinate;' +//the color of the point
    'varying highp float vtexture_coordinate;' +
    'void main(void) { ' +//pre-built function
    'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);' +
    'vtexture_coordinate = texture_coordinate;' +
    '}';

  fragCode_slice_node = 'precision mediump float;' +
    'varying float vtexture_coordinate;' +
    'uniform sampler2D texture_colorbar_sampler;' +
    'void main(void) {' +
    'gl_FragColor = texture2D(texture_colorbar_sampler, vec2(0.5,vtexture_coordinate));' +
    '}';

  /*=================== slice cell file shaders =================== */

  vertCode_slice_cell = 'attribute vec3 position;' +
    'uniform mat4 Pmatrix;' +
    'uniform mat4 Vmatrix;' +
    'uniform mat4 Mmatrix;' +
    'attribute float texture_coordinate;' +//the color of the point
    'varying highp float vtexture_coordinate;' +
    'void main(void) { ' +//pre-built function
    'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);' +
    'vtexture_coordinate = texture_coordinate;' +
    '}';

  fragCode_slice_cell = 'precision mediump float;' +
    'varying float vtexture_coordinate;' +
    'uniform sampler2D texture_colorbar_sampler;' +
    'void main(void) {' +
    'gl_FragColor = texture2D(texture_colorbar_sampler, vec2(0.5,vtexture_coordinate));' +
    '}';

  /*=================== slice geom file shaders =================== */

  vertCode_slice_geom = 'attribute vec3 position;' +
    'uniform mat4 Pmatrix;' +
    'uniform mat4 Vmatrix;' +
    'uniform mat4 Mmatrix;' +
    'attribute float texture_coordinate;' +//the color of the point
    'varying highp float vtexture_coordinate;' +
    'void main(void) { ' +//pre-built function
    'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);' +
    'vtexture_coordinate = texture_coordinate;' +
    '}';

  fragCode_slice_geom = 'precision mediump float;' +
    'varying float vtexture_coordinate;' +
    'uniform sampler2D texture_colorbar_sampler;' +
    'void main(void) {' +
    'gl_FragColor = texture2D(texture_colorbar_sampler, vec2(0.5,vtexture_coordinate));' +
    '}';

  /*=================== bndf node shaders =================== */

  vertCode_bndf_node = 'attribute vec3 position;' +
    'uniform mat4 Pmatrix;' +
    'uniform mat4 Vmatrix;' +
    'uniform mat4 Mmatrix;' +
    'attribute float texture_coordinate;' +//the color of the point
    'varying highp float vtexture_coordinate;' +
    'void main(void) { ' +//pre-built function
    'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);' +
    'vtexture_coordinate = texture_coordinate;' +
    '}';

  fragCode_bndf_node = 'precision mediump float;' +
    'varying float vtexture_coordinate;' +
    'uniform sampler2D texture_colorbar_sampler;' +
    'void main(void) {' +
    'gl_FragColor = texture2D(texture_colorbar_sampler, vec2(0.5,vtexture_coordinate));' +
    '}';

  /*=================== line shaders =================== */

  vertCode_line = 'attribute vec3 position;' +
    'uniform mat4 Pmatrix;' +
    'uniform mat4 Vmatrix;' +
    'uniform mat4 Mmatrix;' +
    'attribute vec3 color;' +//the color of the point
    'varying vec3 vColor;' +
    'void main(void) { ' +//pre-built function
    'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);' +
    'vColor = color;' +
    '}';

  fragCode_line = 'precision mediump float;' +
    'varying vec3 vColor;' +
    'void main(void) {' +
    'gl_FragColor = vec4(vColor, 1.);' +
    '}';

  /*=================== part shaders =================== */
  vertCode_part = 'attribute vec3 position;' +
    'uniform mat4 Pmatrix;' +
    'uniform mat4 Vmatrix;' +
    'uniform mat4 Mmatrix;' +
    'attribute vec3 color;' +//the color of the point
    'varying vec3 vColor;' +
    'void main(void) { ' +//pre-built function
    'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);' +
    'vColor = color;' +
    'gl_PointSize=3.0;' +
    '}';

  fragCode_part = 'precision mediump float;' +
    'varying vec3 vColor;' +
    'void main(void) {' +
    'gl_FragColor = vec4(vColor, 1.);' +
    '}';
  constructor() { }

}
