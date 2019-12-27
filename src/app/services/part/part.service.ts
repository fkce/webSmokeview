import { Injectable } from '@angular/core';
import { GlService } from '../gl/gl.service';
import { ShaderService } from '../shader/shader.service';

@Injectable({
  providedIn: 'root'
})
export class PartService {

  buffer_vertices_part = null;
  buffer_colors_part = null;
  buffer_indices_part = null;

  vertShader_part = null;
  fragShader_part = null;
  shaderprogram_part = null;

  _Pmatrix_part = null;
  _Vmatrix_part = null;
  _Mmatrix_part = null;

  file_ready: boolean = true;

  npart_frames = 2;
  part_frame_size = 5;


  vertices_data = [
    0.0, 1.0, 0.75,
    0.25, 0.75, 0.75,
    0.5, 0.5, 0.75,
    0.75, 0.25, 0.75,
    1.0, 0.0, 0.75,
    0.0, 1.0, 1.0,
    0.25, 0.75, 1.0,
    0.5, 0.5, 1.0,
    0.75, 0.25, 1.0,
    1.0, 0.0, 1.0
  ];

  colors_data = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
    1, 1, 0,
    0, 0, 1,
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
    1, 1, 0,
    0, 0, 1
  ];

  // offsets for each particle frame
  offsets = [
    0, 5
  ];

  // size of each particle frame
  sizes = [
    5, 5
  ];

  vertices = [
    0.0, 1.0, 0.75, 0.25, 0.75, 0.75, 0.5, 0.5, 0.75, 0.75, 0.25, 0.75, 1.0, 0.0, 0.75
  ];

  colors = [
    1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1
  ];

  // must be at least as large as largest particle frame
  indices = [
    0, 1, 2, 3, 4
  ];

  constructor(
    private glS: GlService,
    private shaderService: ShaderService
  ) { }

  // setup part data (particle data - not fully implemented)
  public setupPartData() {

    if (this.file_ready) {
      this.buffer_vertices_part = this.glS.gl.createBuffer();
      this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices_part);
      this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.glS.gl.STATIC_DRAW);

      this.buffer_colors_part = this.glS.gl.createBuffer();
      this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_colors_part);
      this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.colors), this.glS.gl.STATIC_DRAW);

      this.buffer_indices_part = this.glS.gl.createBuffer();
      this.glS.gl.bindBuffer(this.glS.gl.ELEMENT_ARRAY_BUFFER, this.buffer_indices_part);
      if (this.glS.ext_32bit == null) {
        this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.glS.gl.STATIC_DRAW);
      }
      else {
        this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), this.glS.gl.STATIC_DRAW);
      }
    }
  }

  public draw(iframe) {

    this.glS.gl.useProgram(this.shaderprogram_part);
    this.glS.gl.uniformMatrix4fv(this._Pmatrix_part, false, this.glS.proj_matrix);
    this.glS.gl.uniformMatrix4fv(this._Vmatrix_part, false, this.glS.view_matrix);
    this.glS.gl.uniformMatrix4fv(this._Mmatrix_part, false, this.glS.mo_matrix);
    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices_part);
    var _position_part = this.glS.gl.getAttribLocation(this.shaderprogram_part, "position");
    this.glS.gl.vertexAttribPointer(_position_part, 3, this.glS.gl.FLOAT, false, 0, 0);
    this.glS.gl.enableVertexAttribArray(_position_part);

    this.get_part_frame(iframe);

    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices_part);
    this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.glS.gl.STATIC_DRAW);

    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_colors_part);
    this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.colors), this.glS.gl.STATIC_DRAW);

    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_colors_part);
    var _color_part = this.glS.gl.getAttribLocation(this.shaderprogram_part, "color");
    this.glS.gl.vertexAttribPointer(_color_part, 3, this.glS.gl.FLOAT, false, 0, 0);
    this.glS.gl.enableVertexAttribArray(_color_part);

    this.glS.gl.bindBuffer(this.glS.gl.ELEMENT_ARRAY_BUFFER, this.buffer_indices_part);
    if (this.glS.ext_32bit == null) {
      this.glS.gl.drawElements(this.glS.gl.POINTS, this.part_frame_size, this.glS.gl.UNSIGNED_SHORT, 0);
    }
    else {
      this.glS.gl.drawElements(this.glS.gl.POINTS, this.part_frame_size, this.glS.gl.UNSIGNED_INT, 0);
    }
  }

  private get_part_frame(frame) {
    var i;

    var partframe = frame;
    if (partframe > this.npart_frames - 1) partframe = this.npart_frames - 1;
    this.part_frame_size = this.sizes[partframe];
    var part_frame_offset = 3 * this.offsets[partframe];
    for (i = 0; i < this.part_frame_size; i++) {
      this.vertices[3 * i + 0] = this.vertices_data[part_frame_offset + 3 * i + 0];
      this.vertices[3 * i + 1] = this.vertices_data[part_frame_offset + 3 * i + 1];
      this.vertices[3 * i + 2] = this.vertices_data[part_frame_offset + 3 * i + 2];
      this.colors[3 * i + 0] = this.colors_data[part_frame_offset + 3 * i + 0];
      this.colors[3 * i + 1] = this.colors_data[part_frame_offset + 3 * i + 1];
      this.colors[3 * i + 2] = this.colors_data[part_frame_offset + 3 * i + 2];
    }
  }

  /*=================== point/part shaders =================== */
  public createShaders() {


    this.vertShader_part = this.glS.gl.createShader(this.glS.gl.VERTEX_SHADER);
    this.glS.gl.shaderSource(this.vertShader_part, this.shaderService.vertCode_part);
    this.glS.gl.compileShader(this.vertShader_part);

    this.fragShader_part = this.glS.gl.createShader(this.glS.gl.FRAGMENT_SHADER);
    this.glS.gl.shaderSource(this.fragShader_part, this.shaderService.fragCode_part);
    this.glS.gl.compileShader(this.fragShader_part);

    this.shaderprogram_part = this.glS.gl.createProgram();
    this.glS.gl.attachShader(this.shaderprogram_part, this.vertShader_part);
    this.glS.gl.attachShader(this.shaderprogram_part, this.fragShader_part);
    this.glS.gl.linkProgram(this.shaderprogram_part);

    this._Pmatrix_part = this.glS.gl.getUniformLocation(this.shaderprogram_part, "Pmatrix");
    this._Vmatrix_part = this.glS.gl.getUniformLocation(this.shaderprogram_part, "Vmatrix");
    this._Mmatrix_part = this.glS.gl.getUniformLocation(this.shaderprogram_part, "Mmatrix");

  }

}