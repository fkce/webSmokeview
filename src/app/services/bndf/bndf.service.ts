import { Injectable } from '@angular/core';
import { GlService } from '../gl/gl.service';
import { ShaderService } from '../shader/shader.service';

@Injectable({
  providedIn: 'root'
})
export class BndfService {

  buffer_vertices_node = null;
  buffer_textures_node = null;
  buffer_indices_node = null;

  show_node: boolean = false;
  bndf_file_ready: boolean = true;
  frame_bndf_node: number = 24;

  vertShader_bndf_node = null;
  fragShader_bndf_node = null;
  shaderprogram_bndf_node = null;

  _Pmatrix_bndf_node = null;
  _Vmatrix_bndf_node = null;
  _Mmatrix_bndf_node = null;

  vertCode_bndf_node = null;
  fragCode_bndf_node = null;

  // boundary file triangles
  vertices_bndf_node = [
    0.75, 0.125, 0.00, 1.00, 0.125, 0.00, 1.00, 0.375, 0.00, 0.75, 0.375, 0.00,
    0.75, 0.125, 0.25, 1.00, 0.125, 0.25, 1.00, 0.375, 0.25, 0.75, 0.375, 0.25,
    0.75, 0.125, 0.00, 0.75, 0.375, 0.00, 0.75, 0.375, 0.25, 0.75, 0.125, 0.25,
    1.00, 0.125, 0.00, 1.00, 0.375, 0.00, 1.00, 0.375, 0.25, 1.00, 0.125, 0.25,
    0.75, 0.125, 0.00, 0.75, 0.125, 0.25, 1.00, 0.125, 0.25, 1.00, 0.125, 0.00,
    0.75, 0.375, 0.00, 0.75, 0.375, 0.25, 1.00, 0.375, 0.25, 1.00, 0.375, 0.00
  ];

  textures_bndf_node_data = new Uint8Array([
    0, 0, 0, 0,
    38, 38, 38, 38,
    76, 76, 76, 76,
    115, 115, 115, 115,
    153, 153, 153, 153,
    191, 191, 191, 191,
    191, 191, 191, 191,
    0, 0, 0, 0,
    38, 38, 38, 38,
    76, 76, 76, 76,
    115, 115, 115, 115,
    153, 153, 153, 153,
  ]);

  textures_bndf_node = new Float32Array([
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0
  ]);

  indices_bndf_node = [
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
  ];

  constructor(
    private glS: GlService,
    private shaderService: ShaderService
  ) {
    this.vertCode_bndf_node = this.shaderService.vertCode_bndf_node;
    this.fragCode_bndf_node = this.shaderService.fragCode_bndf_node;
  }

  // setup boundary file data
  setupBndfData() {

    if (this.bndf_file_ready) {
      this.buffer_vertices_node = this.glS.gl.createBuffer();
      this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices_node);
      this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.vertices_bndf_node), this.glS.gl.STATIC_DRAW);

      this.buffer_textures_node = this.glS.gl.createBuffer();
      this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_textures_node);
      this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.textures_bndf_node), this.glS.gl.STATIC_DRAW);

      this.buffer_indices_node = this.glS.gl.createBuffer();
      this.glS.gl.bindBuffer(this.glS.gl.ELEMENT_ARRAY_BUFFER, this.buffer_indices_node);
      if (this.glS.ext_32bit == null) {
        this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices_bndf_node), this.glS.gl.STATIC_DRAW);
      }
      else {
        this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices_bndf_node), this.glS.gl.STATIC_DRAW);
      }
    }
  }

  public draw(iframe) {
    this.glS.gl.useProgram(this.shaderprogram_bndf_node);
    this.glS.gl.uniformMatrix4fv(this._Pmatrix_bndf_node, false, this.glS.proj_matrix);
    this.glS.gl.uniformMatrix4fv(this._Vmatrix_bndf_node, false, this.glS.view_matrix);
    this.glS.gl.uniformMatrix4fv(this._Mmatrix_bndf_node, false, this.glS.mo_matrix);

    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices_node);
    var _position_bndf_node = this.glS.gl.getAttribLocation(this.shaderprogram_bndf_node, "position");
    this.glS.gl.vertexAttribPointer(_position_bndf_node, 3, this.glS.gl.FLOAT, false, 0, 0);
    this.glS.gl.enableVertexAttribArray(_position_bndf_node);

    this.get_bndf_node_frame(iframe);

    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_textures_node);
    this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.textures_bndf_node), this.glS.gl.STATIC_DRAW);
    var _texture_coordinate_bndf_node = this.glS.gl.getAttribLocation(this.shaderprogram_bndf_node, "texture_coordinate");
    this.glS.gl.vertexAttribPointer(_texture_coordinate_bndf_node, 1, this.glS.gl.FLOAT, false, 0, 0);
    this.glS.gl.enableVertexAttribArray(_texture_coordinate_bndf_node);

    this.glS.gl.activeTexture(this.glS.gl.TEXTURE0);
    this.glS.gl.bindTexture(this.glS.gl.TEXTURE_2D, this.glS.texture_colorbar);
    var texture_location = this.glS.gl.getUniformLocation(this.shaderprogram_bndf_node, "texture_colorbar_sampler");
    this.glS.gl.uniform1i(texture_location, 0);

    this.glS.gl.bindBuffer(this.glS.gl.ELEMENT_ARRAY_BUFFER, this.buffer_indices_node);
    if (this.glS.ext_32bit == null) {
      this.glS.gl.drawElements(this.glS.gl.TRIANGLES, this.indices_bndf_node.length, this.glS.gl.UNSIGNED_SHORT, 0);
    }
    else {
      this.glS.gl.drawElements(this.glS.gl.TRIANGLES, this.indices_bndf_node.length, this.glS.gl.UNSIGNED_INT, 0);
    }

  }

  /*=================== get_bndf_node_frame =================== */

  private get_bndf_node_frame(frame) {
    var i;

    for (i = 0; i < this.frame_bndf_node; i++) {
      if (this.bndf_file_ready) {
        this.textures_bndf_node[i] = this.textures_bndf_node_data[this.frame_bndf_node * frame + i] / 255.0;
      }
      else {
        this.textures_bndf_node[i] = 128 / 255.0;
      }
    }
  }


  /*=================== bndf node shaders =================== */

  public createShaders() {
    this.vertShader_bndf_node = this.glS.gl.createShader(this.glS.gl.VERTEX_SHADER);
    this.glS.gl.shaderSource(this.vertShader_bndf_node, this.vertCode_bndf_node);
    this.glS.gl.compileShader(this.vertShader_bndf_node);

    this.fragShader_bndf_node = this.glS.gl.createShader(this.glS.gl.FRAGMENT_SHADER);
    this.glS.gl.shaderSource(this.fragShader_bndf_node, this.fragCode_bndf_node);
    this.glS.gl.compileShader(this.fragShader_bndf_node);

    this.shaderprogram_bndf_node = this.glS.gl.createProgram();
    this.glS.gl.attachShader(this.shaderprogram_bndf_node, this.vertShader_bndf_node);
    this.glS.gl.attachShader(this.shaderprogram_bndf_node, this.fragShader_bndf_node);
    this.glS.gl.linkProgram(this.shaderprogram_bndf_node);

    this._Pmatrix_bndf_node = this.glS.gl.getUniformLocation(this.shaderprogram_bndf_node, "Pmatrix");
    this._Vmatrix_bndf_node = this.glS.gl.getUniformLocation(this.shaderprogram_bndf_node, "Vmatrix");
    this._Mmatrix_bndf_node = this.glS.gl.getUniformLocation(this.shaderprogram_bndf_node, "Mmatrix");

  }


}
