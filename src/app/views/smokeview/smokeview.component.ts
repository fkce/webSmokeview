import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ObstService } from 'src/app/services/obst/obst.service';
import { SliceGeomService } from 'src/app/services/slice/slice-geom.service';
import { BabylonService } from 'src/app/services/babylon/babylon.service';
import { SliceService } from 'src/app/services/slice/slice.service';
import { PlayerService } from 'src/app/services/player/player.service';
import { forEach, startsWith, toLower, trim, toNumber, minBy, min, maxBy, max } from 'lodash';
import { InputService } from 'src/app/services/input/input.service';

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
    public sliceService: SliceService,
    public playerService: PlayerService,
    public inputService: InputService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {

    this.babylonService.createScene(this.rendererCanvas);

    //this.obstService.getFromServer();
    //this.sliceService.getFromServer();

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

  /**
   * On FDS file upload
   */
  public onFdsFileSelected() {
    const inputNode: any = document.querySelector('#fileFds');

    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        //this.obstService.getFromFile(JSON.parse(e.target.result));
        // TODO - create FDS object interface ... and class
        let ampers = [];
        let obsts = [];
        let surfs = [];
        let startRecording = false;
        let amper = '';

        forEach(e.target.result, (letter) => {

          if (letter == '&') startRecording = true;
          if (startRecording) amper += letter;

          if (letter == '/') {
            if (amper != '') ampers.push(amper);
            startRecording = false
            amper = '';
          }

        });

        // Find surfs first
        forEach(ampers, (amper) => {

          if (startsWith(toLower(amper), '&surf')) {

            surfs.push({
              id: this.inputService.parseText(amper, 'id'),
              color: this.inputService.parseText(amper, 'color')
            });

          }

        });

        // Find obsts
        forEach(ampers, (amper) => {

          if (startsWith(toLower(amper), '&obst')) {

            let surfId = this.inputService.testParam(amper, 'surf_id') ? this.inputService.parseText(amper, 'surf_id') : ''; 
            
            obsts.push({
              xb: this.inputService.parseXb(amper),
              color: this.inputService.testParam(amper, 'surf_id') ? this.inputService.returnRgb(surfs, surfId) : undefined,
              surf_id: surfId
            });
            
          }

        });

        console.log(surfs);

        let xMin = minBy(obsts, function(obst) { return min(obst.xb.slice(0,2)); }).xb[0];
        let xMax = maxBy(obsts, function(obst) { return max(obst.xb.slice(0,2)); }).xb[1];

        let yMin = minBy(obsts, function(obst) { return min(obst.xb.slice(2,4)); }).xb[2];
        let yMax = maxBy(obsts, function(obst) { return max(obst.xb.slice(2,4)); }).xb[3];

        let zMin = minBy(obsts, function(obst) { return min(obst.xb.slice(4,6)); }).xb[4];
        let zMax = maxBy(obsts, function(obst) { return max(obst.xb.slice(4,6)); }).xb[5];

        // get deltas
        let deltaX = xMax - xMin;
        let deltaY = yMax - yMin;
        let deltaZ = zMax - zMin;
        let delta = max([deltaX, deltaY, deltaZ]);

        // normalize ...
        forEach(obsts, obst => {
          obst.xb[0] += (xMin < 0) ? -xMin : xMin;
          obst.xb[0] /= delta;
          obst.xb[1] += (xMin < 0) ? -xMin : xMin;
          obst.xb[1] /= delta;
          obst.xb[2] += (yMin < 0) ? -yMin : yMin;
          obst.xb[2] /= delta;
          obst.xb[3] += (yMin < 0) ? -yMin : yMin;
          obst.xb[3] /= delta;
          obst.xb[4] += (zMin < 0) ? -zMin : zMin;
          obst.xb[4] /= delta;
          obst.xb[5] += (zMin < 0) ? -zMin : zMin;
          obst.xb[5] /= delta;
        });

        console.log(obsts);
        this.obstService.getTest(obsts);

      };

      reader.readAsText(inputNode.files[0], 'UTF-8');
    }
  }

  public control() {
    if (this.playerService.isPlay) {
      this.playerService.stop();
    } else {
      this.playerService.start();
      this.sliceService.playSlice();
    }

  }

}