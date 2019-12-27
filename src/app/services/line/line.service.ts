import { Injectable } from '@angular/core';
import { GlService } from '../gl/gl.service';
import { ShaderService } from '../shader/shader.service';

@Injectable({
  providedIn: 'root'
})
export class LineService {

  buffer_vertices = null;
  buffer_colors = null;
  buffer_indices = null;

  vertShader_line = null;
  fragShader_line = null;
  shaderprogram_line = null;

  _Pmatrix_line = null;
  _Vmatrix_line = null;
  _Mmatrix_line = null;

  vertCode_line = null;
  fragCode_line = null;

  vertices = [
    0, 0, 0, 0, 1, 1,
    0, 0, 0, 1, 0, 0
  ];

  colors = [
    1, 0, 0, 0, 1, 0,
    0, 0, 1, 1, 1, 0
  ];

  indices = [
    0, 1, 2, 3
  ];

  constructor(
    private glS: GlService,
    private shaderService: ShaderService
  ) {

    this.vertCode_line = this.shaderService.vertCode_line;
    this.fragCode_line = this.shaderService.fragCode_line;
  }

  // setup line data (outline of scene)
  public setupLineData() {

    this.buffer_vertices = this.glS.gl.createBuffer();
    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices);
    this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.glS.gl.STATIC_DRAW);

    this.buffer_colors = this.glS.gl.createBuffer();
    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_colors);
    this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.colors), this.glS.gl.STATIC_DRAW);

    this.buffer_indices = this.glS.gl.createBuffer();
    this.glS.gl.bindBuffer(this.glS.gl.ELEMENT_ARRAY_BUFFER, this.buffer_indices);
    if (this.glS.ext_32bit == null) {
      this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.glS.gl.STATIC_DRAW);
    }
    else {
      this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), this.glS.gl.STATIC_DRAW);
    }
  }

  public draw() {
    this.glS.gl.useProgram(this.shaderprogram_line);
    this.glS.gl.uniformMatrix4fv(this._Pmatrix_line, false, this.glS.proj_matrix);
    this.glS.gl.uniformMatrix4fv(this._Vmatrix_line, false, this.glS.view_matrix);
    this.glS.gl.uniformMatrix4fv(this._Mmatrix_line, false, this.glS.mo_matrix);
    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices);
    var _position_line = this.glS.gl.getAttribLocation(this.shaderprogram_line, "position");
    this.glS.gl.vertexAttribPointer(_position_line, 3, this.glS.gl.FLOAT, false, 0, 0);
    this.glS.gl.enableVertexAttribArray(_position_line);

    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_colors);
    var _color_line = this.glS.gl.getAttribLocation(this.shaderprogram_line, "color");
    this.glS.gl.vertexAttribPointer(_color_line, 3, this.glS.gl.FLOAT, false, 0, 0);
    this.glS.gl.enableVertexAttribArray(_color_line);

    this.glS.gl.bindBuffer(this.glS.gl.ELEMENT_ARRAY_BUFFER, this.buffer_indices);
    if (this.glS.ext_32bit == null) {
      this.glS.gl.drawElements(this.glS.gl.LINES, this.indices.length, this.glS.gl.UNSIGNED_SHORT, 0);
    }
    else {
      this.glS.gl.drawElements(this.glS.gl.LINES, this.indices.length, this.glS.gl.UNSIGNED_INT, 0);
    }
  }

  /*=================== line shaders =================== */

  public createShaders() {

    this.vertShader_line = this.glS.gl.createShader(this.glS.gl.VERTEX_SHADER);
    this.glS.gl.shaderSource(this.vertShader_line, this.vertCode_line);
    this.glS.gl.compileShader(this.vertShader_line);

    this.fragShader_line = this.glS.gl.createShader(this.glS.gl.FRAGMENT_SHADER);
    this.glS.gl.shaderSource(this.fragShader_line, this.shaderService.fragCode_line);
    this.glS.gl.compileShader(this.fragShader_line);

    this.shaderprogram_line = this.glS.gl.createProgram();
    this.glS.gl.attachShader(this.shaderprogram_line, this.vertShader_line);
    this.glS.gl.attachShader(this.shaderprogram_line, this.fragShader_line);
    this.glS.gl.linkProgram(this.shaderprogram_line);

    this._Pmatrix_line = this.glS.gl.getUniformLocation(this.shaderprogram_line, "Pmatrix");
    this._Vmatrix_line = this.glS.gl.getUniformLocation(this.shaderprogram_line, "Vmatrix");
    this._Mmatrix_line = this.glS.gl.getUniformLocation(this.shaderprogram_line, "Mmatrix");


  }

}
