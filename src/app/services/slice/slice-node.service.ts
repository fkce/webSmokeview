import { Injectable } from '@angular/core';
import { GlService } from '../gl/gl.service';
import { shaders as Shaders } from '../../consts/shaders';

@Injectable({
  providedIn: 'root'
})
export class SliceNodeService {

  buffer_vertices_node = null;
  buffer_textures_node = null;
  buffer_indices_node = null;

  show_node: boolean = true;

  node_file_ready: boolean = true;

  vertShader_slice_node = null;
  fragShader_slice_node = null;
  shaderprogram_slice_node = null;

  _Pmatrix_slice_node = null;
  _Vmatrix_slice_node = null;
  _Mmatrix_slice_node = null;

  // Unused / changed
  //frame_size_node = 24;

  // slice node file triangles
  // All vertices coordinates (x,y,z)
  vertices_node = [
    0.5, 0.5, 0.5,
    1.0, 0.5, 0.5,
    1.0, 1.0, 0.5,
    0.5, 1.0, 0.5,

    0.5, 0.5, 1.0,
    1.0, 0.5, 1.0,
    1.0, 1.0, 1.0,
    0.5, 1.0, 1.0,

    0.5, 0.5, 0.5,
    0.5, 1.0, 0.5,
    0.5, 1.0, 1.0,
    0.5, 0.5, 1.0,

    1.0, 0.5, 0.5,
    1.0, 1.0, 0.5,
    1.0, 1.0, 1.0,
    1.0, 0.5, 1.0,

    0.5, 0.5, 0.5,
    0.5, 0.5, 1.0,
    1.0, 0.5, 1.0,
    1.0, 0.5, 0.5,

    0.5, 1.0, 0.5,
    0.5, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 0.5
  ];

  indices_node = [
    0, 1, 2, 
    0, 2, 3, 
    4, 5, 6, 
    4, 6, 7,
    8, 9, 10, 
    8, 10, 11, 
    12, 13, 14, 
    12, 14, 15,
    16, 17, 18, 
    16, 18, 19, 
    20, 21, 22, 
    20, 22, 23
  ];

  textures_node = new Float32Array([
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0
  ]);


  textures_node_data = new Uint8Array([

    // To jest kolor każdego z narożników na skali kolorbar ...
    // Czyli mamy jakiś kolorbar i później interpoluje do najbliższego z przejściami
    191, 191, 191, 191,
    255, 255, 255, 255,
    38, 38, 38, 38,
    76, 76, 76, 76,
    115, 115, 115, 115,
    153, 153, 153, 153,

    0, 0, 0, 0,
    38, 38, 38, 38,
    76, 76, 76, 76,
    115, 115, 115, 115,
    153, 153, 153, 153,
    191, 191, 191, 191,
  ]);

  constructor(
    private glS: GlService
  ) { }

  // setup slice node file data
  public setupData() {

    if (this.node_file_ready) {
      // Create and bind buffer from vertices
      this.buffer_vertices_node = this.glS.gl.createBuffer();
      this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices_node);
      this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.vertices_node), this.glS.gl.STATIC_DRAW);

      // Create and bind buffer data from indices
      this.buffer_indices_node = this.glS.gl.createBuffer();
      this.glS.gl.bindBuffer(this.glS.gl.ELEMENT_ARRAY_BUFFER, this.buffer_indices_node);
      this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices_node), this.glS.gl.STATIC_DRAW);

      // Create and bind buffer data from textures
      this.buffer_textures_node = this.glS.gl.createBuffer();
      this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_textures_node);
      if (this.glS.ext_32bit == null) {
        this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices_node), this.glS.gl.STATIC_DRAW);
      }
      else {
        this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices_node), this.glS.gl.STATIC_DRAW);
      }
    }
  }

  public createShaders() {

    this.vertShader_slice_node = this.glS.gl.createShader(this.glS.gl.VERTEX_SHADER);
    this.glS.gl.shaderSource(this.vertShader_slice_node, Shaders.vertCode_slice_node);
    this.glS.gl.compileShader(this.vertShader_slice_node);

    this.fragShader_slice_node = this.glS.gl.createShader(this.glS.gl.FRAGMENT_SHADER);
    this.glS.gl.shaderSource(this.fragShader_slice_node, Shaders.fragCode_slice_node);
    this.glS.gl.compileShader(this.fragShader_slice_node);

    this.shaderprogram_slice_node = this.glS.gl.createProgram();
    this.glS.gl.attachShader(this.shaderprogram_slice_node, this.vertShader_slice_node);
    this.glS.gl.attachShader(this.shaderprogram_slice_node, this.fragShader_slice_node);
    this.glS.gl.linkProgram(this.shaderprogram_slice_node);

    this._Pmatrix_slice_node = this.glS.gl.getUniformLocation(this.shaderprogram_slice_node, "Pmatrix");
    this._Vmatrix_slice_node = this.glS.gl.getUniformLocation(this.shaderprogram_slice_node, "Vmatrix");
    this._Mmatrix_slice_node = this.glS.gl.getUniformLocation(this.shaderprogram_slice_node, "Mmatrix");
  }


  public draw(iframe: number) {
    // ?? to read what program does
    this.glS.gl.useProgram(this.shaderprogram_slice_node);
    // Asign matrixes
    this.glS.gl.uniformMatrix4fv(this._Pmatrix_slice_node, false, this.glS.proj_matrix);
    this.glS.gl.uniformMatrix4fv(this._Vmatrix_slice_node, false, this.glS.view_matrix);
    this.glS.gl.uniformMatrix4fv(this._Mmatrix_slice_node, false, this.glS.mo_matrix);

    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices_node);
    var _position_slice_node = this.glS.gl.getAttribLocation(this.shaderprogram_slice_node, "position");
    this.glS.gl.vertexAttribPointer(_position_slice_node, 3, this.glS.gl.FLOAT, false, 0, 0);
    this.glS.gl.enableVertexAttribArray(_position_slice_node);

    this.get_slice_node_frame(iframe);

    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_textures_node);
    this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.textures_node), this.glS.gl.STATIC_DRAW);
    var _texture_coordinate_slice_node = this.glS.gl.getAttribLocation(this.shaderprogram_slice_node, "texture_coordinate");
    this.glS.gl.vertexAttribPointer(_texture_coordinate_slice_node, 1, this.glS.gl.FLOAT, false, 0, 0);
    this.glS.gl.enableVertexAttribArray(_texture_coordinate_slice_node);

    this.glS.gl.activeTexture(this.glS.gl.TEXTURE0);
    this.glS.gl.bindTexture(this.glS.gl.TEXTURE_2D, this.glS.texture_colorbar);
    var texture_location = this.glS.gl.getUniformLocation(this.shaderprogram_slice_node, "texture_colorbar_sampler");
    this.glS.gl.uniform1i(texture_location, 0);

    this.glS.gl.bindBuffer(this.glS.gl.ELEMENT_ARRAY_BUFFER, this.buffer_indices_node);
    if (this.glS.ext_32bit == null) {
      this.glS.gl.drawElements(this.glS.gl.TRIANGLES, this.indices_node.length, this.glS.gl.UNSIGNED_SHORT, 0);
    }
    else {
      this.glS.gl.drawElements(this.glS.gl.TRIANGLES, this.indices_node.length, this.glS.gl.UNSIGNED_INT, 0);
    }
  }

  private get_slice_node_frame(frame) {
    var i;

    for (i = 0; i < this.textures_node.length; i++) {
      if (this.node_file_ready) {
        this.textures_node[i] = this.textures_node_data[this.textures_node.length * frame + i] / 255.0;
      }
      else {
        this.textures_node[i] = 128 / 255.0;
      }
    }
  }

}
