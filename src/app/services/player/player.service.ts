import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  play: boolean = true;

  dt: number = 50;

  frameSize: number = 0;
  frameNo: number = 0;
  frameCur: number = 0;

  sliderWidth: number = 0;
  sliderInterval: any;

  constructor() { }

  /**
   * Changing current frame
   * @param event slidebar click
   */
  public onSliderChange(event: any) {
    this.frameCur = event.value;
  }


  /**
   * Set slider bar 
   */
  public setSlider(): number {
    return (this.sliderWidth - 2) / (this.frameNo - 1) * this.frameCur;
  }

  /**
   * Set interval
   */
  public stop() {
    if(this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
    this.play = false;
  }

  public start() {
    this.play = true;
  }


}
