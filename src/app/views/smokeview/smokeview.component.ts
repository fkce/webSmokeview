import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ObstService } from 'src/app/services/obst/obst.service';
import { ShaderService } from 'src/app/services/shader/shader.service';
import { SliceService } from 'src/app/services/slice/slice.service';
import { BndfService } from 'src/app/services/bndf/bndf.service';
import { PartService } from 'src/app/services/part/part.service';
import { GeomService } from 'src/app/services/geom/geom.service';
import { LineService } from 'src/app/services/line/line.service';
import { GlService } from 'src/app/services/gl/gl.service';

@Component({
  selector: 'app-smokeview',
  templateUrl: './smokeview.component.html',
  styleUrls: ['./smokeview.component.scss']
})
export class SmokeviewComponent implements AfterViewInit {

  @ViewChild('webSmokeview', { static: true }) canvas: ElementRef;
  gl: any = null;

  ext_32bit = null;

  show_blockages: boolean = true;
  show_geom: boolean = true;
  show_outlines: boolean = true;
  show_part: boolean = true;

  nframes = 1;

  scene_vr = 0;

  npart_frames = 2;
  part_frame_size = 5;

  /*================= ??? ======================*/
  THETA = 0;
  PHI = 0;
  time_old = 0;
  iframe = 0;
  time_option = 3;

  /*================= Events ======================*/

  drag = false;
  old_x = null;
  old_y = null;
  dX = 0;
  dY = 0;
  dKEYx = 0;
  dKEYy = 0;
  dKEYz = 0;
  ctrl_key = 0;
  alt_key = 0;
  double_click = 0;
  touch_mode = 0;
  using_touch = 0;
  prev_dist = 0;

  // smokeview replaces following ***VERTS line with vertices, colors and indices arrays

  xcen = 0.5;
  ycen = 0.5;
  zcen = 0.5;
  //document.getElementById("buttonPauseResume").style.width = "125px";

  texture_colorbar_data = null;
  texture_colorbar_numcolors = null;

  constructor(
    public glS: GlService,
    public obstService: ObstService,
    private shaderService: ShaderService,
    public sliceService: SliceService,
    public bndfService: BndfService,
    public partService: PartService,
    public geomService: GeomService,
    public lineService: LineService,
  ) {
    this.texture_colorbar_data = this.obstService.texture_colorbar_data;
    this.texture_colorbar_numcolors = this.obstService.texture_colorbar_numcolors;
  }

  ngAfterViewInit() {

    var self = this;

    this.gl = this.canvas.nativeElement.getContext('experimental-webgl');
    this.glS.gl = this.canvas.nativeElement.getContext('experimental-webgl');
    if (!this.glS.gl) {
      alert("Your browser does not support webgl");
      return;
    }
    this.ext_32bit = this.gl.getExtension('OES_element_index_uint');
    this.glS.ext_32bit = this.glS.gl.getExtension('OES_element_index_uint');

    //***VERTS
    //HIDE_ON

    // setup colorbar

    var texture_colorbar = this.gl.createTexture();
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture_colorbar);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, this.texture_colorbar_numcolors, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.texture_colorbar_data);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    this.obstService.setupObstData();
    this.geomService.setupGeomData();
    this.setupSliceNodeData();
    this.setupSliceCellData();
    this.setupSliceGeomData();

    this.setupBndfData();
    this.setupLineData();
    this.setupPartData();

    /*=================== obst shaders =================== */

    var vertShader_obst_lit = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vertShader_obst_lit, this.shaderService.vertCode_obst_lit);
    this.gl.compileShader(vertShader_obst_lit);

    var fragShader_obst_lit = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragShader_obst_lit, this.shaderService.fragCode_obst_lit);
    this.gl.compileShader(fragShader_obst_lit);

    var shaderprogram_obst_lit = this.gl.createProgram();
    this.gl.attachShader(shaderprogram_obst_lit, vertShader_obst_lit);
    this.gl.attachShader(shaderprogram_obst_lit, fragShader_obst_lit);
    this.gl.linkProgram(shaderprogram_obst_lit);

    var _Pmatrix_obst_lit = this.gl.getUniformLocation(shaderprogram_obst_lit, "Pmatrix");
    var _Vmatrix_obst_lit = this.gl.getUniformLocation(shaderprogram_obst_lit, "Vmatrix");
    var _Mmatrix_obst_lit = this.gl.getUniformLocation(shaderprogram_obst_lit, "Mmatrix");
    var _normal_matrix_obst_lit = this.gl.getUniformLocation(shaderprogram_obst_lit, "normal_matrix");

    /*=================== geom shaders =================== */

    var vertShader_geom_lit = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vertShader_geom_lit, this.shaderService.vertCode_geom_lit);
    this.gl.compileShader(vertShader_geom_lit);

    var fragShader_geom_lit = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragShader_geom_lit, this.shaderService.fragCode_geom_lit);
    this.gl.compileShader(fragShader_geom_lit);

    var shaderprogram_geom_lit = this.gl.createProgram();
    this.gl.attachShader(shaderprogram_geom_lit, vertShader_geom_lit);
    this.gl.attachShader(shaderprogram_geom_lit, fragShader_geom_lit);
    this.gl.linkProgram(shaderprogram_geom_lit);

    var _Pmatrix_geom_lit = this.gl.getUniformLocation(shaderprogram_geom_lit, "Pmatrix");
    var _Vmatrix_geom_lit = this.gl.getUniformLocation(shaderprogram_geom_lit, "Vmatrix");
    var _Mmatrix_geom_lit = this.gl.getUniformLocation(shaderprogram_geom_lit, "Mmatrix");
    var _normal_matrix_geom_lit = this.gl.getUniformLocation(shaderprogram_geom_lit, "normal_matrix");

    /*=================== slice node file shaders =================== */

    var vertShader_slice_node = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vertShader_slice_node, this.shaderService.vertCode_slice_node);
    this.gl.compileShader(vertShader_slice_node);

    var fragShader_slice_node = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragShader_slice_node, this.shaderService.fragCode_slice_node);
    this.gl.compileShader(fragShader_slice_node);

    var shaderprogram_slice_node = this.gl.createProgram();
    this.gl.attachShader(shaderprogram_slice_node, vertShader_slice_node);
    this.gl.attachShader(shaderprogram_slice_node, fragShader_slice_node);
    this.gl.linkProgram(shaderprogram_slice_node);

    var _Pmatrix_slice_node = this.gl.getUniformLocation(shaderprogram_slice_node, "Pmatrix");
    var _Vmatrix_slice_node = this.gl.getUniformLocation(shaderprogram_slice_node, "Vmatrix");
    var _Mmatrix_slice_node = this.gl.getUniformLocation(shaderprogram_slice_node, "Mmatrix");

    /*=================== slice cell file shaders =================== */

    var vertShader_slice_cell = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vertShader_slice_cell, this.shaderService.vertCode_slice_cell);
    this.gl.compileShader(vertShader_slice_cell);

    var fragShader_slice_cell = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragShader_slice_cell, this.shaderService.fragCode_slice_cell);
    this.gl.compileShader(fragShader_slice_cell);

    var shaderprogram_slice_cell = this.gl.createProgram();
    this.gl.attachShader(shaderprogram_slice_cell, vertShader_slice_cell);
    this.gl.attachShader(shaderprogram_slice_cell, fragShader_slice_cell);
    this.gl.linkProgram(shaderprogram_slice_cell);

    var _Pmatrix_slice_cell = this.gl.getUniformLocation(shaderprogram_slice_cell, "Pmatrix");
    var _Vmatrix_slice_cell = this.gl.getUniformLocation(shaderprogram_slice_cell, "Vmatrix");
    var _Mmatrix_slice_cell = this.gl.getUniformLocation(shaderprogram_slice_cell, "Mmatrix");

    /*=================== slice geom file shaders =================== */

    var vertShader_slice_geom = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vertShader_slice_geom, this.shaderService.vertCode_slice_geom);
    this.gl.compileShader(vertShader_slice_geom);

    var fragShader_slice_geom = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragShader_slice_geom, this.shaderService.fragCode_slice_geom);
    this.gl.compileShader(fragShader_slice_geom);

    var shaderprogram_slice_geom = this.gl.createProgram();
    this.gl.attachShader(shaderprogram_slice_geom, vertShader_slice_geom);
    this.gl.attachShader(shaderprogram_slice_geom, fragShader_slice_geom);
    this.gl.linkProgram(shaderprogram_slice_geom);

    var _Pmatrix_slice_geom = this.gl.getUniformLocation(shaderprogram_slice_geom, "Pmatrix");
    var _Vmatrix_slice_geom = this.gl.getUniformLocation(shaderprogram_slice_geom, "Vmatrix");
    var _Mmatrix_slice_geom = this.gl.getUniformLocation(shaderprogram_slice_geom, "Mmatrix");

    /*=================== bndf node shaders =================== */

    var vertShader_bndf_node = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vertShader_bndf_node, this.shaderService.vertCode_bndf_node);
    this.gl.compileShader(vertShader_bndf_node);

    var fragShader_bndf_node = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragShader_bndf_node, this.shaderService.fragCode_bndf_node);
    this.gl.compileShader(fragShader_bndf_node);

    var shaderprogram_bndf_node = this.gl.createProgram();
    this.gl.attachShader(shaderprogram_bndf_node, vertShader_bndf_node);
    this.gl.attachShader(shaderprogram_bndf_node, fragShader_bndf_node);
    this.gl.linkProgram(shaderprogram_bndf_node);

    var _Pmatrix_bndf_node = this.gl.getUniformLocation(shaderprogram_bndf_node, "Pmatrix");
    var _Vmatrix_bndf_node = this.gl.getUniformLocation(shaderprogram_bndf_node, "Vmatrix");
    var _Mmatrix_bndf_node = this.gl.getUniformLocation(shaderprogram_bndf_node, "Mmatrix");

    /*=================== line shaders =================== */

    var vertShader_line = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vertShader_line, this.shaderService.vertCode_line);
    this.gl.compileShader(vertShader_line);

    var fragShader_line = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragShader_line, this.shaderService.fragCode_line);
    this.gl.compileShader(fragShader_line);

    var shaderprogram_line = this.gl.createProgram();
    this.gl.attachShader(shaderprogram_line, vertShader_line);
    this.gl.attachShader(shaderprogram_line, fragShader_line);
    this.gl.linkProgram(shaderprogram_line);

    var _Pmatrix_line = this.gl.getUniformLocation(shaderprogram_line, "Pmatrix");
    var _Vmatrix_line = this.gl.getUniformLocation(shaderprogram_line, "Vmatrix");
    var _Mmatrix_line = this.gl.getUniformLocation(shaderprogram_line, "Mmatrix");

    /*=================== point/part shaders =================== */

    var vertShader_part = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vertShader_part, this.shaderService.vertCode_part);
    this.gl.compileShader(vertShader_part);

    var fragShader_part = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragShader_part, this.shaderService.fragCode_part);
    this.gl.compileShader(fragShader_part);

    var shaderprogram_part = this.gl.createProgram();
    this.gl.attachShader(shaderprogram_part, vertShader_part);
    this.gl.attachShader(shaderprogram_part, fragShader_part);
    this.gl.linkProgram(shaderprogram_part);

    var _Pmatrix_part = this.gl.getUniformLocation(shaderprogram_part, "Pmatrix");
    var _Vmatrix_part = this.gl.getUniformLocation(shaderprogram_part, "Vmatrix");
    var _Mmatrix_part = this.gl.getUniformLocation(shaderprogram_part, "Mmatrix");

    var projection_angle = 10.0;
    var proj_matrix = this.get_projection(projection_angle, this.canvas.nativeElement.width / this.canvas.nativeElement.height, 1, 100);
    var mo_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    var view_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    var normal_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    view_matrix[14] -= 7.0;

    /*=================== mouseDown =================== */

    var mouseDown = function (e) {
      window.focus();
      self.ctrl_key = 0;
      self.alt_key = 0;
      if (e.ctrlKey == true) {
        self.ctrl_key = 1;
      }
      if (e.altKey == true) {
        self.alt_key = 1;
      }

      self.drag = true;
      self.old_x = e.pageX;
      self.old_y = e.pageY;
      self.prev_dist = 0;
      if (e.touches) {
        if (e.touches.length == 3) {
          self.PHI = 0.0;
          self.THETA = 0.0;
          self.dX = 0;
          self.dY = 0;
          self.dKEYx = 0;
          self.dKEYy = 0;
          self.dKEYz = 0;
          self.touch_mode = 0;
          e.preventDefault();
          return false;
        }
        self.old_x = e.touches[0].pageX;
        self.old_y = e.touches[0].pageY;
        if (self.double_click == 0) {
          self.double_click = 1;
          setTimeout(function () { self.double_click = 0; }, 300);
          return false;
        }
        if (e.touches.length == 1) self.touch_mode = 1 - self.touch_mode;
      }
      e.preventDefault();
      return false;
    };

    /*=================== mouseUp =================== */

    var mouseUp = function (e) {
      self.drag = false;
    };

    /*=================== mouseMove =================== */

    var mouseMove = (e) => {
      if (!self.drag) return false;
      var new_x = e.pageX;
      var new_y = e.pageY;

      if (e.touches) {

        // 1 finger, touch_mode==0 : rotate
        // 1 finger, touch_mode==1 : move left/right, up/down
        // 2 fingers               : move in/out
        // 3 fingers               : reset view

        self.alt_key = 0;
        self.ctrl_key = 0;
        if (e.touches.length > 2) {
          self.PHI = 0.0;
          self.THETA = 0.0;
          self.dX = 0;
          self.dY = 0;
          self.dKEYx = 0;
          self.dKEYy = 0;
          self.dKEYz = 0;
          e.preventDefault();
          return false;
        }
        self.using_touch = 1;
        if (e.touches.length == 2) {
          self.ctrl_key = 1;
          var dx_touch = e.touches[1].pageX - e.touches[0].pageX;
          var dy_touch = e.touches[1].pageY - e.touches[0].pageY;
          var cur_dist = Math.sqrt(dx_touch * dx_touch + dy_touch * dy_touch);
        }
        else {
          if (self.touch_mode == 1) self.alt_key = 1;
        }
        new_x = e.touches[0].pageX;
        new_y = e.touches[0].pageY;
      }
      if (self.alt_key == 0 && self.ctrl_key == 0) {
        self.dX = (new_x - self.old_x) * 2 * Math.PI / this.canvas.nativeElement.width,
          self.dY = (new_y - self.old_y) * 2 * Math.PI / this.canvas.nativeElement.height;
        self.THETA += self.dX;
        self.PHI += self.dY;
      }
      else if (self.alt_key == 1) {
        if (self.touch_mode == 1) {
          self.dX = (new_x - self.old_x) / this.canvas.nativeElement.width,
            self.dKEYx -= 3 * self.dX;
        }
        self.dY = (new_y - self.old_y) / this.canvas.nativeElement.height;
        self.dKEYz += 3 * self.dY;
      }
      else { // ctrl_key==1
        if (self.using_touch == 0) {
          self.dX = (new_x - self.old_x) / this.canvas.nativeElement.width,
            self.dKEYx -= 3 * self.dX;
          self.dY = (new_y - self.old_y) / this.canvas.nativeElement.height;
          self.dKEYy += 3 * self.dY;
        }
        else {
          if (self.prev_dist > 0) {
            self.dY = 3 * (cur_dist - self.prev_dist) / this.canvas.nativeElement.height;
            self.dKEYy -= self.dY;
          }
        }
        self.prev_dist = cur_dist;
      }
      self.old_x = new_x;
      self.old_y = new_y;
      e.preventDefault();
    };

    /*=================== handleOrientation=================== */

    function handleOrientation(e) {
      // alpha angle about z axis
      // beta  angle about x axis
      // gamma angle about y axis
      self.PHI = e.beta * Math.PI / 180.0;
      self.THETA = e.gamma * Math.PI / 180.0;
    }

    /*=================== register callbacks =================== */

    this.canvas.nativeElement.addEventListener("mousedown", mouseDown, false);
    this.canvas.nativeElement.addEventListener("mouseup", mouseUp, false);
    this.canvas.nativeElement.addEventListener("mouseout", mouseUp, false);
    this.canvas.nativeElement.addEventListener("mousemove", mouseMove, false);

    this.canvas.nativeElement.addEventListener("touchstart", mouseDown, false);
    this.canvas.nativeElement.addEventListener("touchmove", mouseMove, false);
    this.canvas.nativeElement.addEventListener("touchend", mouseUp, false);
    this.canvas.nativeElement.addEventListener("touchcancel", mouseUp, false);

    this.canvas.nativeElement.addEventListener("deviceorientation", handleOrientation, false);



    function render(time) {
      if (self.scene_vr == 1) {
        animate(time, -1);
        animate(time, 1);
      }
      else {
        animate(time, 0);
      }
      window.requestAnimationFrame(render);
    }
    render(0);

    /*=================== animate =================== */

    function animate(time, port) {
      var dt = time - self.time_old;
      var background_color = 0.85

      //set model matrix to the identity

      mo_matrix[0] = 1, mo_matrix[1] = 0, mo_matrix[2] = 0, mo_matrix[3] = 0,
        mo_matrix[4] = 0, mo_matrix[5] = 1, mo_matrix[6] = 0, mo_matrix[7] = 0,
        mo_matrix[8] = 0, mo_matrix[9] = 0, mo_matrix[10] = 1, mo_matrix[11] = 0,
        mo_matrix[12] = 0, mo_matrix[13] = 0, mo_matrix[14] = 0, mo_matrix[15] = 1;

      // rotate 90 deg to be consistent with smokeview
      self.rotateX(mo_matrix, -1.57078);

      // scale scene by 1/2 if in VR mode
      if (port != 0) {
        self.scaleZ(mo_matrix, 0.5);
      }

      // scale and translate to be consistent with smokeview
      var scale = 1.5;
      var min_xz = 2.0 * Math.min(self.xcen, self.zcen);
      self.translateXYZ(mo_matrix, -scale * self.xcen / min_xz, -scale * self.ycen, -scale * self.zcen / min_xz);
      self.scaleAll(mo_matrix, scale / min_xz);

      // translate
      self.translateXYZ(mo_matrix, self.dKEYx, self.dKEYy, self.dKEYz);

      // rotate (translate to origin first)
      self.translateXYZ(mo_matrix, self.xcen, self.ycen, self.zcen);
      self.rotateX(mo_matrix, self.PHI);
      self.rotateZ(mo_matrix, self.THETA);
      self.translateXYZ(mo_matrix, -self.xcen, -self.ycen, -self.zcen);

      normal_matrix = self.mat_inverse(mo_matrix);
      normal_matrix = self.mat_transpose(normal_matrix);

      self.time_old = time;
      self.gl.enable(self.gl.DEPTH_TEST);

      if (port != 1) {
        self.gl.clearColor(background_color, background_color, background_color, 1.0);
        self.gl.clearDepth(1.0);
      }
      if (port == -1) {
        //let frameData = new VRFrameData()
        //let vrDisplay.getFrameData(frameData);
        self.gl.viewport(0.0, 0.0, self.canvas.nativeElement.width / 2, self.canvas.nativeElement.height);
        self.gl.clear(self.gl.COLOR_BUFFER_BIT | self.gl.DEPTH_BUFFER_BIT);
      }
      else if (port == 0) {
        self.gl.viewport(0.0, 0.0, self.canvas.nativeElement.width, self.canvas.nativeElement.height);
        self.gl.clear(self.gl.COLOR_BUFFER_BIT | self.gl.DEPTH_BUFFER_BIT);
      }
      else if (port == 1) {
        //let frameData = new VRFrameData()
        // let vrDisplay.getFrameData(frameData);
        self.gl.viewport(self.canvas.nativeElement.width / 2, 0.0, self.canvas.nativeElement.width / 2, self.canvas.nativeElement.height);
      }

      // draw blockage triangles

      if (self.show_blockages == true) {
        self.gl.useProgram(shaderprogram_obst_lit);
        self.gl.uniformMatrix4fv(_Pmatrix_obst_lit, false, proj_matrix);
        self.gl.uniformMatrix4fv(_Vmatrix_obst_lit, false, view_matrix);
        self.gl.uniformMatrix4fv(_Mmatrix_obst_lit, false, mo_matrix);
        self.gl.uniformMatrix4fv(_normal_matrix_obst_lit, false, normal_matrix);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.obstService.buffer_vertices_lit);
        var _position_obst_lit = self.gl.getAttribLocation(shaderprogram_obst_lit, "position");
        self.gl.vertexAttribPointer(_position_obst_lit, 3, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_position_obst_lit);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.obstService.buffer_colors_lit);
        var _color_obst_lit = self.gl.getAttribLocation(shaderprogram_obst_lit, "color");
        self.gl.vertexAttribPointer(_color_obst_lit, 3, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_color_obst_lit);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.obstService.buffer_normals_lit);
        var _normal_obst_lit = self.gl.getAttribLocation(shaderprogram_obst_lit, "normal");
        self.gl.vertexAttribPointer(_normal_obst_lit, 3, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_normal_obst_lit);

        self.gl.bindBuffer(self.gl.ELEMENT_ARRAY_BUFFER, self.obstService.buffer_indices_lit);

        if (self.ext_32bit == null) {
          self.gl.drawElements(self.gl.TRIANGLES, self.obstService.indices_lit.length, self.gl.UNSIGNED_SHORT, 0);
        }
        else {
          self.gl.drawElements(self.gl.TRIANGLES, self.obstService.indices_lit.length, self.gl.UNSIGNED_INT, 0);
        }
      }

      // draw geom triangles

      if (self.show_geom == true) {
        self.gl.useProgram(shaderprogram_geom_lit);
        self.gl.uniformMatrix4fv(_Pmatrix_geom_lit, false, proj_matrix);
        self.gl.uniformMatrix4fv(_Vmatrix_geom_lit, false, view_matrix);
        self.gl.uniformMatrix4fv(_Mmatrix_geom_lit, false, mo_matrix);
        self.gl.uniformMatrix4fv(_normal_matrix_geom_lit, false, normal_matrix);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.geomService.buffer_vertices_lit);
        var _position_geom_lit = self.gl.getAttribLocation(shaderprogram_geom_lit, "position");
        self.gl.vertexAttribPointer(_position_geom_lit, 3, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_position_geom_lit);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.geomService.buffer_colors_lit);
        var _color_geom_lit = self.gl.getAttribLocation(shaderprogram_geom_lit, "color");
        self.gl.vertexAttribPointer(_color_geom_lit, 3, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_color_geom_lit);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.geomService.buffer_normals_lit);
        var _normal_geom_lit = self.gl.getAttribLocation(shaderprogram_geom_lit, "normal");
        self.gl.vertexAttribPointer(_normal_geom_lit, 3, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_normal_geom_lit);

        self.gl.bindBuffer(self.gl.ELEMENT_ARRAY_BUFFER, self.geomService.buffer_indices_lit);

        if (self.ext_32bit == null) {
          self.gl.drawElements(self.gl.TRIANGLES, self.geomService.indices_lit.length, self.gl.UNSIGNED_SHORT, 0);
        }
        else {
          self.gl.drawElements(self.gl.TRIANGLES, self.geomService.indices_lit.length, self.gl.UNSIGNED_INT, 0);
        }
      }

      // draw slice node file triangles

      if (self.sliceService.node_file_ready && self.sliceService.show_node) {
        self.gl.useProgram(shaderprogram_slice_node);
        self.gl.uniformMatrix4fv(_Pmatrix_slice_node, false, proj_matrix);
        self.gl.uniformMatrix4fv(_Vmatrix_slice_node, false, view_matrix);
        self.gl.uniformMatrix4fv(_Mmatrix_slice_node, false, mo_matrix);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.sliceService.buffer_vertices_node);
        var _position_slice_node = self.gl.getAttribLocation(shaderprogram_slice_node, "position");
        self.gl.vertexAttribPointer(_position_slice_node, 3, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_position_slice_node);

        self.get_slice_node_frame(self.iframe);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.sliceService.buffer_textures_node);
        self.gl.bufferData(self.gl.ARRAY_BUFFER, new Float32Array(self.sliceService.textures_node), self.gl.STATIC_DRAW);
        var _texture_coordinate_slice_node = self.gl.getAttribLocation(shaderprogram_slice_node, "texture_coordinate");
        self.gl.vertexAttribPointer(_texture_coordinate_slice_node, 1, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_texture_coordinate_slice_node);

        self.gl.activeTexture(self.gl.TEXTURE0);
        self.gl.bindTexture(self.gl.TEXTURE_2D, texture_colorbar);
        var texture_location = self.gl.getUniformLocation(shaderprogram_slice_node, "texture_colorbar_sampler");
        self.gl.uniform1i(texture_location, 0);

        self.gl.bindBuffer(self.gl.ELEMENT_ARRAY_BUFFER, self.sliceService.buffer_indices_node);
        if (self.ext_32bit == null) {
          self.gl.drawElements(self.gl.TRIANGLES, self.sliceService.indices_node.length, self.gl.UNSIGNED_SHORT, 0);
        }
        else {
          self.gl.drawElements(self.gl.TRIANGLES, self.sliceService.indices_node.length, self.gl.UNSIGNED_INT, 0);
        }
      }

      // draw slice cell file triangles

      if (self.sliceService.cell_file_ready && self.sliceService.show_cell) {
        self.gl.useProgram(shaderprogram_slice_cell);
        self.gl.uniformMatrix4fv(_Pmatrix_slice_cell, false, proj_matrix);
        self.gl.uniformMatrix4fv(_Vmatrix_slice_cell, false, view_matrix);
        self.gl.uniformMatrix4fv(_Mmatrix_slice_cell, false, mo_matrix);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.sliceService.buffer_vertices_cell);
        var _position_slice_cell = self.gl.getAttribLocation(shaderprogram_slice_cell, "position");
        self.gl.vertexAttribPointer(_position_slice_cell, 3, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_position_slice_cell);

        self.get_slice_cell_frame(self.iframe);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.sliceService.buffer_textures_cell);
        self.gl.bufferData(self.gl.ARRAY_BUFFER, new Float32Array(self.sliceService.textures_cell), self.gl.STATIC_DRAW);
        var _texture_coordinate_slice_cell = self.gl.getAttribLocation(shaderprogram_slice_cell, "texture_coordinate");
        self.gl.vertexAttribPointer(_texture_coordinate_slice_cell, 1, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_texture_coordinate_slice_cell);

        self.gl.activeTexture(self.gl.TEXTURE0);
        self.gl.bindTexture(self.gl.TEXTURE_2D, texture_colorbar);
        var texture_location = self.gl.getUniformLocation(shaderprogram_slice_cell, "texture_colorbar_sampler");
        self.gl.uniform1i(texture_location, 0);

        self.gl.bindBuffer(self.gl.ELEMENT_ARRAY_BUFFER, self.sliceService.buffer_indices_cell);
        if (self.ext_32bit == null) {
          self.gl.drawElements(self.gl.TRIANGLES, self.sliceService.indices_cell.length, self.gl.UNSIGNED_SHORT, 0);
        }
        else {
          self.gl.drawElements(self.gl.TRIANGLES, self.sliceService.indices_cell.length, self.gl.UNSIGNED_INT, 0);
        }
      }

      // draw slice geom file triangles

      if (self.sliceService.geom_file_ready && self.sliceService.show_geom) {
        self.gl.useProgram(shaderprogram_slice_geom);
        self.gl.uniformMatrix4fv(_Pmatrix_slice_geom, false, proj_matrix);
        self.gl.uniformMatrix4fv(_Vmatrix_slice_geom, false, view_matrix);
        self.gl.uniformMatrix4fv(_Mmatrix_slice_geom, false, mo_matrix);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.sliceService.buffer_vertices_geom);
        var _position_slice_geom = self.gl.getAttribLocation(shaderprogram_slice_geom, "position");
        self.gl.vertexAttribPointer(_position_slice_geom, 3, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_position_slice_geom);

        self.get_slice_geom_frame(self.iframe);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.sliceService.buffer_textures_geom);
        self.gl.bufferData(self.gl.ARRAY_BUFFER, new Float32Array(self.sliceService.textures_geom), self.gl.STATIC_DRAW);
        var _texture_coordinate_slice_geom = self.gl.getAttribLocation(shaderprogram_slice_geom, "texture_coordinate");
        self.gl.vertexAttribPointer(_texture_coordinate_slice_geom, 1, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_texture_coordinate_slice_geom);

        self.gl.activeTexture(self.gl.TEXTURE0);
        self.gl.bindTexture(self.gl.TEXTURE_2D, texture_colorbar);
        var texture_location = self.gl.getUniformLocation(shaderprogram_slice_geom, "texture_colorbar_sampler");
        self.gl.uniform1i(texture_location, 0);

        self.gl.bindBuffer(self.gl.ELEMENT_ARRAY_BUFFER, self.sliceService.buffer_indices_geom);
        if (self.ext_32bit == null) {
          self.gl.drawElements(self.gl.TRIANGLES, self.sliceService.indices_geom.length, self.gl.UNSIGNED_SHORT, 0);
        }
        else {
          self.gl.drawElements(self.gl.TRIANGLES, self.sliceService.indices_geom.length, self.gl.UNSIGNED_INT, 0);
        }
      }


      // draw boundary file triangles

      if (self.bndfService.bndf_file_ready && self.bndfService.show_node) {
        self.gl.useProgram(shaderprogram_bndf_node);
        self.gl.uniformMatrix4fv(_Pmatrix_bndf_node, false, proj_matrix);
        self.gl.uniformMatrix4fv(_Vmatrix_bndf_node, false, view_matrix);
        self.gl.uniformMatrix4fv(_Mmatrix_bndf_node, false, mo_matrix);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.bndfService.buffer_vertices_node);
        var _position_bndf_node = self.gl.getAttribLocation(shaderprogram_bndf_node, "position");
        self.gl.vertexAttribPointer(_position_bndf_node, 3, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_position_bndf_node);

        self.get_bndf_node_frame(self.iframe);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.bndfService.buffer_textures_node);
        self.gl.bufferData(self.gl.ARRAY_BUFFER, new Float32Array(self.bndfService.textures_bndf_node), self.gl.STATIC_DRAW);
        var _texture_coordinate_bndf_node = self.gl.getAttribLocation(shaderprogram_bndf_node, "texture_coordinate");
        self.gl.vertexAttribPointer(_texture_coordinate_bndf_node, 1, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_texture_coordinate_bndf_node);

        self.gl.activeTexture(self.gl.TEXTURE0);
        self.gl.bindTexture(self.gl.TEXTURE_2D, texture_colorbar);
        var texture_location = self.gl.getUniformLocation(shaderprogram_bndf_node, "texture_colorbar_sampler");
        self.gl.uniform1i(texture_location, 0);

        self.gl.bindBuffer(self.gl.ELEMENT_ARRAY_BUFFER, self.bndfService.buffer_indices_node);
        if (self.ext_32bit == null) {
          self.gl.drawElements(self.gl.TRIANGLES, self.bndfService.indices_bndf_node.length, self.gl.UNSIGNED_SHORT, 0);
        }
        else {
          self.gl.drawElements(self.gl.TRIANGLES, self.bndfService.indices_bndf_node.length, self.gl.UNSIGNED_INT, 0);
        }
      }

      // draw outlines

      if (self.show_outlines == true) {
        self.gl.useProgram(shaderprogram_line);
        self.gl.uniformMatrix4fv(_Pmatrix_line, false, proj_matrix);
        self.gl.uniformMatrix4fv(_Vmatrix_line, false, view_matrix);
        self.gl.uniformMatrix4fv(_Mmatrix_line, false, mo_matrix);
        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.lineService.buffer_vertices);
        var _position_line = self.gl.getAttribLocation(shaderprogram_line, "position");
        self.gl.vertexAttribPointer(_position_line, 3, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_position_line);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.lineService.buffer_colors);
        var _color_line = self.gl.getAttribLocation(shaderprogram_line, "color");
        self.gl.vertexAttribPointer(_color_line, 3, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_color_line);

        self.gl.bindBuffer(self.gl.ELEMENT_ARRAY_BUFFER, self.lineService.buffer_indices);
        if (self.ext_32bit == null) {
          self.gl.drawElements(self.gl.LINES, self.lineService.indices.length, self.gl.UNSIGNED_SHORT, 0);
        }
        else {
          self.gl.drawElements(self.gl.LINES, self.lineService.indices.length, self.gl.UNSIGNED_INT, 0);
        }
      }

      // draw particles

      if (self.partService.file_ready && self.show_part) {
        self.gl.useProgram(shaderprogram_part);
        self.gl.uniformMatrix4fv(_Pmatrix_part, false, proj_matrix);
        self.gl.uniformMatrix4fv(_Vmatrix_part, false, view_matrix);
        self.gl.uniformMatrix4fv(_Mmatrix_part, false, mo_matrix);
        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.partService.buffer_vertices_part);
        var _position_part = self.gl.getAttribLocation(shaderprogram_part, "position");
        self.gl.vertexAttribPointer(_position_part, 3, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_position_part);

        self.get_part_frame(self.iframe);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.partService.buffer_vertices_part);
        self.gl.bufferData(self.gl.ARRAY_BUFFER, new Float32Array(self.partService.vertices), self.gl.STATIC_DRAW);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.partService.buffer_colors_part);
        self.gl.bufferData(self.gl.ARRAY_BUFFER, new Float32Array(self.partService.colors), self.gl.STATIC_DRAW);


        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.partService.buffer_colors_part);
        var _color_part = self.gl.getAttribLocation(shaderprogram_part, "color");
        self.gl.vertexAttribPointer(_color_part, 3, self.gl.FLOAT, false, 0, 0);
        self.gl.enableVertexAttribArray(_color_part);

        self.gl.bindBuffer(self.gl.ELEMENT_ARRAY_BUFFER, self.partService.buffer_indices_part);
        if (self.ext_32bit == null) {
          self.gl.drawElements(self.gl.POINTS, self.part_frame_size, self.gl.UNSIGNED_SHORT, 0);
        }
        else {
          self.gl.drawElements(self.gl.POINTS, self.part_frame_size, self.gl.UNSIGNED_INT, 0);
        }
      }

      if (self.time_option == 3) {
        self.iframe++;
      }
      else if (self.time_option == -2) {
        self.iframe = 0;
        self.time_option = 0;
      }
      else if (self.time_option == -1) {
        self.iframe--;
        self.time_option = 0;
      }
      else if (self.time_option == 1) {
        self.iframe++;
        self.time_option = 0;
      }
      else if (self.time_option == 2) {
        self.iframe = self.nframes - 1;
        self.time_option = 0;
      }

      if (self.iframe < 0) self.iframe = self.nframes - 1;
      if (self.iframe > self.nframes - 1) self.iframe = 0;
    }

  }


  // setup slice node file data
  setupSliceNodeData() {

    if (this.sliceService.node_file_ready) {
      this.sliceService.buffer_vertices_node = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sliceService.buffer_vertices_node);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.sliceService.vertices_node), this.gl.STATIC_DRAW);

      this.sliceService.buffer_textures_node = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sliceService.buffer_textures_node);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.sliceService.textures_node), this.gl.STATIC_DRAW);

      this.sliceService.buffer_indices_node = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.sliceService.buffer_indices_node);
      if (this.ext_32bit == null) {
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.sliceService.indices_node), this.gl.STATIC_DRAW);
      }
      else {
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.sliceService.indices_node), this.gl.STATIC_DRAW);
      }
    }
  }

  // setup slice cell file data

  setupSliceCellData() {

    if (this.sliceService.cell_file_ready) {
      this.sliceService.buffer_vertices_cell = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sliceService.buffer_vertices_cell);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.sliceService.vertices_cell), this.gl.STATIC_DRAW);

      this.sliceService.buffer_textures_cell = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sliceService.buffer_textures_cell);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.sliceService.textures_cell), this.gl.STATIC_DRAW);

      this.sliceService.buffer_indices_cell = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.sliceService.buffer_indices_cell);
      if (this.ext_32bit == null) {
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.sliceService.indices_cell), this.gl.STATIC_DRAW);
      }
      else {
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.sliceService.indices_cell), this.gl.STATIC_DRAW);
      }
    }
  }

  // setup slice geom file data

  setupSliceGeomData() {

    if (this.sliceService.geom_file_ready) {
      this.sliceService.buffer_vertices_geom = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sliceService.buffer_vertices_geom);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.sliceService.vertices_geom), this.gl.STATIC_DRAW);

      this.sliceService.buffer_textures_geom = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sliceService.buffer_textures_geom);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.sliceService.textures_geom), this.gl.STATIC_DRAW);

      this.sliceService.buffer_indices_geom = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.sliceService.buffer_indices_geom);
      if (this.ext_32bit == null) {
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.sliceService.indices_geom), this.gl.STATIC_DRAW);
      }
      else {
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.sliceService.indices_geom), this.gl.STATIC_DRAW);
      }
    }

  }
  // setup boundary file data

  setupBndfData() {

    if (this.bndfService.bndf_file_ready) {
      this.bndfService.buffer_vertices_node = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bndfService.buffer_vertices_node);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.bndfService.vertices_bndf_node), this.gl.STATIC_DRAW);

      this.bndfService.buffer_textures_node = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bndfService.buffer_textures_node);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.bndfService.textures_bndf_node), this.gl.STATIC_DRAW);

      this.bndfService.buffer_indices_node = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.bndfService.buffer_indices_node);
      if (this.ext_32bit == null) {
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.bndfService.indices_bndf_node), this.gl.STATIC_DRAW);
      }
      else {
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.bndfService.indices_bndf_node), this.gl.STATIC_DRAW);
      }
    }
  }

  // setup line data (outline of scene)

  setupLineData() {

    this.lineService.buffer_vertices = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lineService.buffer_vertices);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.lineService.vertices), this.gl.STATIC_DRAW);

    this.lineService.buffer_colors = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lineService.buffer_colors);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.lineService.colors), this.gl.STATIC_DRAW);

    this.lineService.buffer_indices = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.lineService.buffer_indices);
    if (this.ext_32bit == null) {
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.lineService.indices), this.gl.STATIC_DRAW);
    }
    else {
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.lineService.indices), this.gl.STATIC_DRAW);
    }
  }

  // setup part data (particle data - not fully implemented)

  setupPartData() {

    if (this.partService.file_ready) {
      this.partService.buffer_vertices_part = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.partService.buffer_vertices_part);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.partService.vertices), this.gl.STATIC_DRAW);

      this.partService.buffer_colors_part = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.partService.buffer_colors_part);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.partService.colors), this.gl.STATIC_DRAW);

      this.partService.buffer_indices_part = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.partService.buffer_indices_part);
      if (this.ext_32bit == null) {
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.partService.indices), this.gl.STATIC_DRAW);
      }
      else {
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.partService.indices), this.gl.STATIC_DRAW);
      }
    }
  }

  /*=================== EnterVr =================== */

  private EnterVR(option) {
    this.scene_vr = 1 - this.scene_vr;
  }

  /*=================== ShowHide =================== */

  private ShowHide(show_var) {
    return 1 - show_var;
  }

  /*=================== get_projection =================== */

  private get_projection(angle, a, zMin, zMax) {
    var ang = Math.tan((angle * .5) * Math.PI / 180);//angle*.5
    return [
      0.5 / ang, 0, 0, 0,
      0, 0.5 * a / ang, 0, 0,
      0, 0, -(zMax + zMin) / (zMax - zMin), -1,
      0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
    ];
  }

  //  M =   R  T  =  m0 m4  m8 m12  (R == orthogonal rotation matrix, T == translation vector)
  //        0  1     m1 m5  m9 m13
  //                 m2 m6 m10 m14
  //                 m3 m7 m11 m15

  // the following routines post-multiply M by one of the following transformation matrices

  // rotatate about x axis  1  0 0 0
  //                        0  c s 0    c=cos(angle), s=sin(angle)
  //                        0 -s c 0
  //                        0  0 0 1

  // rotatate about z axis  c  s 0 0
  //                        c -s 0 0
  //                        0  0 1 0
  //                        0  0 0 1

  // translate by (x,y,z)  1 0 0 x
  //                       0 1 0 y
  //                       0 0 1 z
  //                       0 0 0 1

  // scale by (x,y,z)   x 0 0 0
  //                    0 y 0 0
  //                    0 0 z 0
  //                    0 0 0 1

  /*=================== rotateX =================== */

  rotateX(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv4 = m[4], mv5 = m[5], mv6 = m[6], mv7 = m[7];

    m[4] = m[4] * c + m[8] * s;
    m[5] = m[5] * c + m[9] * s;
    m[6] = m[6] * c + m[10] * s;
    m[7] = m[7] * c + m[11] * s;

    m[8] = m[8] * c - mv4 * s;
    m[9] = m[9] * c - mv5 * s;
    m[10] = m[10] * c - mv6 * s;
    m[11] = m[11] * c - mv7 * s;
  }

  /*=================== rotateZ =================== */

  rotateZ(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv1 = m[1], mv2 = m[2], mv3 = m[3];

    m[0] = m[0] * c + m[4] * s;
    m[1] = m[1] * c + m[5] * s;
    m[2] = m[2] * c + m[6] * s;
    m[3] = m[3] * c + m[7] * s;

    m[4] = m[4] * c - mv0 * s;
    m[5] = m[5] * c - mv1 * s;
    m[6] = m[6] * c - mv2 * s;
    m[7] = m[7] * c - mv3 * s;
  }

  /*=================== translateXYZ =================== */

  translateXYZ(m, X, Y, Z) {
    m[12] += m[0] * X + m[4] * Y + m[8] * Z;
    m[13] += m[1] * X + m[5] * Y + m[9] * Z;
    m[14] += m[2] * X + m[6] * Y + m[10] * Z;
  }

  /*=================== scaleXYZ =================== */

  scaleXYZ(m, X, Y, Z) {
    m[0] *= X, m[4] *= Y, m[8] *= Z;
    m[1] *= X, m[5] *= Y, m[9] *= Z;
    m[2] *= X, m[6] *= Y, m[10] *= Z;
    m[3] *= X, m[7] *= Y, m[11] *= Z;
  }


  /*=================== scaleAll =================== */

  scaleAll(m, X) {
    m[0] *= X, m[4] *= X, m[8] *= X;
    m[1] *= X, m[5] *= X, m[9] *= X;
    m[2] *= X, m[6] *= X, m[10] *= X;
    m[3] *= X, m[7] *= X, m[11] *= X;
  }

  /*=================== scaleZ =================== */

  scaleZ(m, Z) {
    m[8] *= Z;
    m[9] *= Z;
    m[10] *= Z;
    m[11] *= Z;
  }

  /*=================== mat_transpose =================== */

  mat_transpose(m) {
    return [
      m[0], m[4], m[8], m[12],
      m[1], m[5], m[9], m[13],
      m[2], m[6], m[10], m[14],
      m[3], m[7], m[11], m[15]
    ];
  }

  /*=================== dot_prod =================== */

  dot_prod(b, sb, c, sc) {
    return b[sb] * c[sc] +
      b[sb + 4] * c[sc + 1] +
      b[sb + 8] * c[sc + 2] +
      b[sb + 12] * c[sc + 3];
  }

  /*=================== mat_mult =================== */

  mat_mult(b, c) {
    return [
      this.dot_prod(b, 0, c, 0), this.dot_prod(b, 1, c, 0), this.dot_prod(b, 2, c, 0), this.dot_prod(b, 3, c, 0),
      this.dot_prod(b, 0, c, 1), this.dot_prod(b, 1, c, 1), this.dot_prod(b, 2, c, 0), this.dot_prod(b, 3, c, 1),
      this.dot_prod(b, 0, c, 2), this.dot_prod(b, 1, c, 2), this.dot_prod(b, 2, c, 0), this.dot_prod(b, 3, c, 2),
      this.dot_prod(b, 0, c, 3), this.dot_prod(b, 1, c, 3), this.dot_prod(b, 2, c, 0), this.dot_prod(b, 3, c, 3)
    ];
  }

  /*=================== mat_inverse =================== */

  mat_inverse(a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;

    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (det == 0.0) det = 1.0;
    det = 1.0 / det;
    var out0 = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    var out1 = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    var out2 = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    var out3 = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    var out4 = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    var out5 = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    var out6 = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    var out7 = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    var out8 = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    var out9 = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    var out10 = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    var out11 = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    var out12 = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    var out13 = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    var out14 = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    var out15 = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return [
      out0, out1, out2, out3,
      out4, out5, out6, out7,
      out8, out9, out10, out11,
      out12, out13, out14, out15
    ];

  }


  /*=================== SetTime =================== */

  SetTime(option) {
    if (option == -2) {
      this.time_option = option;
    }
    else if (option == -1) {
      this.time_option = option;
    }
    else if (option == 0) {
      if (this.time_option == 3) {
        this.time_option = 0;
        //document.getElementById("buttonPauseResume").innerHTML = "Resume " + iframe;
        //document.getElementById("buttonPauseResume").style.width = "125px";
      }
      else {
        this.time_option = 3;
        //document.getElementById("buttonPauseResume").innerHTML = "Pause " + iframe;
        //document.getElementById("buttonPauseResume").style.width = "125px";
      }
    }
    else if (option == 1) {
      this.time_option = option;
    }
    else if (option == 2) {
      this.time_option = option;
    }
  }

  /*=================== Reset =================== */

  private Reset(option) {
    this.PHI = 0.0;
    this.THETA = 0.0;
    this.dX = 0;
    this.dY = 0;
    this.dKEYx = 0;
    this.dKEYy = 0;
    this.dKEYz = 0;
  }

  /*=================== get_bndf_node_frame =================== */

  private get_bndf_node_frame(frame) {
    var i;

    for (i = 0; i < this.bndfService.frame_bndf_node; i++) {
      if (this.bndfService.bndf_file_ready) {
        this.bndfService.textures_bndf_node[i] = this.bndfService.textures_bndf_node_data[this.bndfService.frame_bndf_node * frame + i] / 255.0;
      }
      else {
        this.bndfService.textures_bndf_node[i] = 128 / 255.0;
      }
    }
  }

  /*=================== get_slice_node_frame =================== */

  private get_slice_node_frame(frame) {
    var i;

    for (i = 0; i < this.sliceService.frame_size_node; i++) {
      if (this.sliceService.node_file_ready) {
        this.sliceService.textures_node[i] = this.sliceService.textures_node_data[this.sliceService.frame_size_node * frame + i] / 255.0;
      }
      else {
        this.sliceService.textures_node[i] = 128 / 255.0;
      }
    }
  }

  /*=================== get_slice_cell_frame =================== */

  private get_slice_cell_frame(frame) {
    var i;

    for (i = 0; i < this.sliceService.frame_size_cell; i++) {
      if (this.sliceService.cell_file_ready) {
        this.sliceService.textures_cell[i] = this.sliceService.textures_cell_data[this.sliceService.frame_size_cell * frame + i] / 255.0;
      }
      else {
        this.sliceService.textures_cell[i] = 128 / 255.0;
      }
    }
  }

  /*=================== get_slice_geom_frame =================== */

  private get_slice_geom_frame(frame) {
    var i;

    for (i = 0; i < this.sliceService.frame_size_geom; i++) {
      if (this.sliceService.geom_file_ready) {
        this.sliceService.textures_geom[i] = this.sliceService.textures_geom_data[this.sliceService.frame_size_geom * frame + i] / 255.0;
      }
      else {
        this.sliceService.textures_geom[i] = 128 / 255.0;
      }
    }
  }

  /*=================== get_part_frame =================== */

  private get_part_frame(frame) {
    var i;

    var partframe = frame;
    if (partframe > this.npart_frames - 1) partframe = this.npart_frames - 1;
    this.part_frame_size = this.partService.sizes[partframe];
    var part_frame_offset = 3 * this.partService.offsets[partframe];
    for (i = 0; i < this.part_frame_size; i++) {
      this.partService.vertices[3 * i + 0] = this.partService.vertices_data[part_frame_offset + 3 * i + 0];
      this.partService.vertices[3 * i + 1] = this.partService.vertices_data[part_frame_offset + 3 * i + 1];
      this.partService.vertices[3 * i + 2] = this.partService.vertices_data[part_frame_offset + 3 * i + 2];
      this.partService.colors[3 * i + 0] = this.partService.colors_data[part_frame_offset + 3 * i + 0];
      this.partService.colors[3 * i + 1] = this.partService.colors_data[part_frame_offset + 3 * i + 1];
      this.partService.colors[3 * i + 2] = this.partService.colors_data[part_frame_offset + 3 * i + 2];
    }
  }

  public xxx() {
    this.nframes = 1;
  }

}
