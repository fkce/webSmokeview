import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ObstService } from 'src/app/services/obst/obst.service';
import { SliceGeomService } from 'src/app/services/slice/slice-geom.service';
import { BabylonService } from 'src/app/services/babylon/babylon.service';
import { SliceService } from 'src/app/services/slice/slice.service';

@Component({
  selector: 'app-smokeview',
  templateUrl: './smokeview.component.html',
  styleUrls: ['./smokeview.component.scss']
})
export class SmokeviewComponent implements AfterViewInit {

  @ViewChild('rendererCanvas', { static: true }) rendererCanvas: ElementRef<HTMLCanvasElement>;

  constructor(
    public obstService: ObstService,
    public sliceGeomService: SliceGeomService,
    private babylonService: BabylonService,
    public sliceService: SliceService
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {

    this.babylonService.createScene(this.rendererCanvas);

    this.obstService.getFromServer();
    this.sliceService.getFromServer();

    this.babylonService.animate();

  }

  /**
   * On OBST file upload
   */
  public onObstFileSelected() {
    const inputNode: any = document.querySelector('#fileObst');

    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.obstService.getFromFile(JSON.parse(e.target.result));
      };

      reader.readAsText(inputNode.files[0], 'UTF-8');
    }
  }

  /**
   * On slice file upload
   */
  public onSliceFileSelected() {
    const inputNode: any = document.querySelector('#fileSlice');

    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.sliceService.getFromFile(JSON.parse(e.target.result));
      };

      reader.readAsText(inputNode.files[0], 'UTF-8');
    }
  }

}