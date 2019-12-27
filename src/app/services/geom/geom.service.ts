import { Injectable } from '@angular/core';
import { GlService } from '../gl/gl.service';

@Injectable({
  providedIn: 'root'
})
export class GeomService {

  buffer_vertices_lit = null;
  buffer_normals_lit = null;
  buffer_colors_lit = null;
  buffer_indices_lit = null;

  vertShader_lit = null;
  fragShader_lit = null;
  shaderprogram_lit = null;

  _Pmatrix_lit = null;
  _Vmatrix_lit = null;
  _Mmatrix_lit = null;
  _normal_matrix_lit = null;

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


  // geometry
  vertices_lit = [
    0.0, 0.6, 0.0, 0.5, 0.6, 0.0, 0.5, 1.0, 0.0, 0.0, 1.0, 0.0, // bottom
    0.0, 0.6, 0.5, 0.5, 0.6, 0.5, 0.5, 1.0, 0.5, 0.0, 1.0, 0.5, // top
    0.0, 0.6, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.5, 0.0, 0.6, 0.5, // left
    0.5, 0.6, 0.0, 0.5, 1.0, 0.0, 0.5, 1.0, 0.5, 0.5, 0.6, 0.5, // right
    0.0, 0.6, 0.0, 0.0, 0.6, 0.5, 0.5, 0.6, 0.5, 0.5, 0.6, 0.0, // back
    0.0, 1.0, 0.0, 0.0, 1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.0, // front
  ];

  normals_lit = [
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, // bottom
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, // top
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, // left
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // right
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // back
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0  // front
  ];

  // if (this.ext_32bit == null) {
  //   colors_geom_lit = [
  //     1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  //     1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
  //     1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  //     1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
  //     0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
  //   ];
  // }
  // else {
  colors_lit = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
    1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
  ];

  indices_lit = [
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
  ];


  constructor(
    private glS: GlService
  ) { }

  // setup geom data
  public setupGeomData() {

    this.buffer_vertices_lit = this.glS.gl.createBuffer();
    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices_lit);
    this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.vertices_lit), this.glS.gl.STATIC_DRAW);

    this.buffer_normals_lit = this.glS.gl.createBuffer();
    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_normals_lit);
    this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.normals_lit), this.glS.gl.STATIC_DRAW);

    this.buffer_colors_lit = this.glS.gl.createBuffer();
    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_colors_lit);
    this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.colors_lit), this.glS.gl.STATIC_DRAW);

    this.buffer_indices_lit = this.glS.gl.createBuffer();
    this.glS.gl.bindBuffer(this.glS.gl.ELEMENT_ARRAY_BUFFER, this.buffer_indices_lit);
    if (this.glS.ext_32bit == null) {
      this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices_lit), this.glS.gl.STATIC_DRAW);
    }
    else {
      this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices_lit), this.glS.gl.STATIC_DRAW);
    }
  }

  public draw() {
      this.glS.gl.useProgram(this.shaderprogram_lit);
      this.glS.gl.uniformMatrix4fv(this._Pmatrix_lit, false, this.glS.proj_matrix);
      this.glS.gl.uniformMatrix4fv(this._Vmatrix_lit, false, this.glS.view_matrix);
      this.glS.gl.uniformMatrix4fv(this._Mmatrix_lit, false, this.glS.mo_matrix);
      this.glS.gl.uniformMatrix4fv(this._normal_matrix_lit, false, this.glS.normal_matrix);

      this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices_lit);
      var _position_geom_lit = this.glS.gl.getAttribLocation(this.shaderprogram_lit, "position");
      this.glS.gl.vertexAttribPointer(_position_geom_lit, 3, this.glS.gl.FLOAT, false, 0, 0);
      this.glS.gl.enableVertexAttribArray(_position_geom_lit);

      this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_colors_lit);
      var _color_geom_lit = this.glS.gl.getAttribLocation(this.shaderprogram_lit, "color");
      this.glS.gl.vertexAttribPointer(_color_geom_lit, 3, this.glS.gl.FLOAT, false, 0, 0);
      this.glS.gl.enableVertexAttribArray(_color_geom_lit);

      this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_normals_lit);
      var _normal_geom_lit = this.glS.gl.getAttribLocation(this.shaderprogram_lit, "normal");
      this.glS.gl.vertexAttribPointer(_normal_geom_lit, 3, this.glS.gl.FLOAT, false, 0, 0);
      this.glS.gl.enableVertexAttribArray(_normal_geom_lit);

      this.glS.gl.bindBuffer(this.glS.gl.ELEMENT_ARRAY_BUFFER, this.buffer_indices_lit);

      if (this.glS.ext_32bit == null) {
        this.glS.gl.drawElements(this.glS.gl.TRIANGLES, this.indices_lit.length, this.glS.gl.UNSIGNED_SHORT, 0);
      }
      else {
        this.glS.gl.drawElements(this.glS.gl.TRIANGLES, this.indices_lit.length, this.glS.gl.UNSIGNED_INT, 0);
      }
  }

  public createShaders() {
    this.vertShader_lit = this.glS.gl.createShader(this.glS.gl.VERTEX_SHADER);
    this.glS.gl.shaderSource(this.vertShader_lit, this.vertCode_geom_lit);
    this.glS.gl.compileShader(this.vertShader_lit);

    this.fragShader_lit = this.glS.gl.createShader(this.glS.gl.FRAGMENT_SHADER);
    this.glS.gl.shaderSource(this.fragShader_lit, this.fragCode_geom_lit);
    this.glS.gl.compileShader(this.fragShader_lit);

    this.shaderprogram_lit = this.glS.gl.createProgram();
    this.glS.gl.attachShader(this.shaderprogram_lit, this.vertShader_lit);
    this.glS.gl.attachShader(this.shaderprogram_lit, this.fragShader_lit);
    this.glS.gl.linkProgram(this.shaderprogram_lit);

    this._Pmatrix_lit = this.glS.gl.getUniformLocation(this.shaderprogram_lit, "Pmatrix");
    this._Vmatrix_lit = this.glS.gl.getUniformLocation(this.shaderprogram_lit, "Vmatrix");
    this._Mmatrix_lit = this.glS.gl.getUniformLocation(this.shaderprogram_lit, "Mmatrix");
    this._normal_matrix_lit = this.glS.gl.getUniformLocation(this.shaderprogram_lit, "normal_matrix");
  }

}
