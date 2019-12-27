import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShaderService {



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
