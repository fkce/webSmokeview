import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { ObstService } from 'src/app/services/obst/obst.service';
import { ShaderService } from 'src/app/services/shader/shader.service';
import { BndfService } from 'src/app/services/bndf/bndf.service';
import { PartService } from 'src/app/services/part/part.service';
import { GeomService } from 'src/app/services/geom/geom.service';
import { LineService } from 'src/app/services/line/line.service';
import { GlService } from 'src/app/services/gl/gl.service';
import { EventsService } from 'src/app/services/events/events.service';
import { HelpersService } from 'src/app/services/helpers/helpers.service';
import { SliceGeomService } from 'src/app/services/slice/slice-geom.service';
import { SliceNodeService } from 'src/app/services/slice/slice-node.service';
import { SliceCellService } from 'src/app/services/slice/slice-cell.service';

@Component({
  selector: 'app-smokeview',
  templateUrl: './smokeview.component.html',
  styleUrls: ['./smokeview.component.scss']
})
export class SmokeviewComponent implements AfterViewInit {

  @ViewChild('webSmokeview', { static: true }) canvas: ElementRef;

  //@HostListener('document:keyup', ['$event'])
  //onKeyUp(ev:KeyboardEvent) {
  //  // do something meaningful with it
  //  console.log(`The user just pressed ${ev.key}!`);
  //}

  gl: any = null;


  ext_32bit = null;

  show_blockages: boolean = false;
  show_geom: boolean = false;
  show_outlines: boolean = false;
  show_part: boolean = false;

  nframes = 1;
  scene_vr = 0;

  time_old = 0;
  iframe = 0;
  time_option = 3;

  constructor(
    public eventsService: EventsService,
    public glS: GlService,
    public obstService: ObstService,
    public sliceNodeService: SliceNodeService,
    public sliceCellService: SliceCellService,
    public sliceGeomService: SliceGeomService,
    public bndfService: BndfService,
    public partService: PartService,
    public geomService: GeomService,
    public lineService: LineService,
    public helpersService: HelpersService,
  ) {
  }


  ngAfterViewInit() {

    this.glS.gl = this.canvas.nativeElement.getContext('experimental-webgl');

    this.glS.canvasWidth = this.canvas.nativeElement.width;
    this.glS.canvasHeight = this.canvas.nativeElement.height;

    if (!this.glS.gl) {
      alert("Your browser does not support webgl");
      return;
    }
    this.glS.ext_32bit = this.glS.gl.getExtension('OES_element_index_uint');

    /**
     * Setup colorbar
     * 1. Data should be passed according to colorbar,
     * probably in most cases we need rainbow colorbar ...
     */
    this.glS.setupColorBar();

    /**
     * Setup buffers
     * 1. Data should be passed from smokeview boot or 
     * should be generated dynamicly from files ...
     * 2. Rest query from server ...
     */
    this.obstService.setupData();
    this.geomService.setupGeomData();
    this.sliceNodeService.setupData();
    this.sliceCellService.setupData();
    this.sliceGeomService.setupData();
    this.bndfService.setupBndfData();
    this.lineService.setupLineData();
    this.partService.setupPartData();

    /**
     * Setup shaders
     * 1. Probably constant for each case ...
     * Ask Glenn ...
     */
    this.obstService.createShaders();
    this.geomService.createShaders();
    this.sliceNodeService.createShaders();
    this.sliceCellService.createShaders();
    this.sliceGeomService.createShaders();
    this.bndfService.createShaders();
    this.lineService.createShaders();
    this.partService.createShaders();

    /**
     * Need description ...
     */
    this.glS.init();

    /**
     * Register animate callback and run animate loop
     */
    var self = this;
    function render(time) {
      if (self.scene_vr == 1) {
        self.animate(time, -1);
        self.animate(time, 1);
      }
      else {
        self.animate(time, 0);
      }
      window.requestAnimationFrame(render);
    }
    render(0);

  }


  /**
   * Main animate loop
   * @param time 
   * @param port 
   */
  public animate(time, port) {

    // ?
    var dt = time - this.time_old;
    // Bacground color value: 0 - black, 1 - white
    var background_color = 0.85

    this.glS.draw();

    this.time_old = time;

    if (port != 1) {
      this.glS.gl.clearColor(background_color, background_color, background_color, 1.0);
      this.glS.gl.clearDepth(1.0);
    }
    if (port == -1) {
      //let frameData = new VRFrameData()
      //let vrDisplay.getFrameData(frameData);
      this.glS.gl.viewport(0.0, 0.0, this.canvas.nativeElement.width / 2, this.canvas.nativeElement.height);
      this.glS.gl.clear(this.glS.gl.COLOR_BUFFER_BIT | this.glS.gl.DEPTH_BUFFER_BIT);
    }
    else if (port == 0) {
      this.glS.gl.viewport(0.0, 0.0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.glS.gl.clear(this.glS.gl.COLOR_BUFFER_BIT | this.glS.gl.DEPTH_BUFFER_BIT);
    }
    else if (port == 1) {
      //let frameData = new VRFrameData()
      // let vrDisplay.getFrameData(frameData);
      this.glS.gl.viewport(this.canvas.nativeElement.width / 2, 0.0, this.canvas.nativeElement.width / 2, this.canvas.nativeElement.height);
    }

    // draw blockage triangles
    if (this.show_blockages == true) {
      this.obstService.draw();
    }

    // draw geom triangles
    if (this.show_geom == true) {
      this.geomService.draw();
    }

    // draw slice node file triangles
    if (this.sliceNodeService.node_file_ready && this.sliceNodeService.show_node) {
      this.sliceNodeService.draw(this.iframe);
    }

    // draw slice cell file triangles
    if (this.sliceCellService.cell_file_ready && this.sliceCellService.show_cell) {
      this.sliceCellService.draw(this.iframe);
    }

    // draw slice geom file triangles
    if (this.sliceGeomService.geom_file_ready && this.sliceGeomService.show_geom) {
      this.sliceGeomService.draw(this.iframe);
    }

    // draw boundary file triangles
    if (this.bndfService.bndf_file_ready && this.bndfService.show_node) {
      this.bndfService.draw(this.iframe);
    }

    // draw outlines
    if (this.show_outlines == true) {
      this.lineService.draw();
    }

    // draw particles
    if (this.partService.file_ready && this.show_part) {
      this.partService.draw(this.iframe);
    }

    /**
     * Time options
     * 3 -> play
     * -2 -> 
     * -1 ->
     * +1 ->
     * +2 ->
     */
    if (this.time_option == 3) {
      this.iframe++;
    }
    else if (this.time_option == -2) {
      this.iframe = 0;
      this.time_option = 0;
    }
    else if (this.time_option == -1) {
      this.iframe--;
      this.time_option = 0;
    }
    else if (this.time_option == 1) {
      this.iframe++;
      this.time_option = 0;
    }
    else if (this.time_option == 2) {
      this.iframe = this.nframes - 1;
      this.time_option = 0;
    }

    // Rewind to end
    if (this.iframe < 0) this.iframe = this.nframes - 1;
    // Rewind to begining
    if (this.iframe > this.nframes - 1) this.iframe = 0;
  }

  /*=================== EnterVr =================== */
  private EnterVR(option) {
    this.scene_vr = 1 - this.scene_vr;
  }

  /*=================== ShowHide =================== */
  private ShowHide(show_var) {
    return 1 - show_var;
  }

}
