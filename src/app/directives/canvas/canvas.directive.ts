import { Directive, HostListener, isDevMode } from '@angular/core';
import { EventsService } from 'src/app/services/events/events.service';
import { GlService } from 'src/app/services/gl/gl.service';

@Directive({
  selector: '[canvas]'
})
export class CanvasDirective {

  drag: boolean = false;
  old_x: number = null;
  old_y: number = null;
  dX: number = 0;
  dY: number = 0;

  dKEYx: number = 0;
  dKEYy: number = 0;
  dKEYz: number = 0;

  THETA: number = 0;
  PHI: number = 0;

  ctrl_key: boolean = false;
  alt_key: boolean = false;
  double_click: boolean = false;
  touch_mode: boolean = false;
  using_touch: boolean = false;

  prev_dist: number = 0;

  constructor(
    private eventsService: EventsService,
    public glS: GlService
  ) { }

  @HostListener('mousedown', ['$event']) onMouseDown(event: MouseEvent) {
    window.focus();
    this.ctrl_key = false;
    this.alt_key = false;
    if (event.ctrlKey == true) {
      this.ctrl_key = true;
    }
    if (event.altKey == true) {
      this.alt_key = true;
    }

    this.drag = true;
    this.old_x = event.pageX;
    this.old_y = event.pageY;
    this.prev_dist = 0;
    if (event['touches']) {
      if (event['touches'].length == 3) {
        this.PHI = 0.0;
        this.eventsService.PHI$.next(this.PHI);
        this.THETA = 0.0;
        this.eventsService.THETA$.next(this.THETA);
        this.dX = 0;
        this.dY = 0;
        this.dKEYx = 0;
        this.eventsService.dKEYx$.next(this.dKEYx);
        this.dKEYy = 0;
        this.eventsService.dKEYy$.next(this.dKEYy);
        this.dKEYz = 0;
        this.eventsService.dKEYz$.next(this.dKEYz);
        this.touch_mode = false;
        event.preventDefault();
        return false;
      }
      this.old_x = event['touches'][0].pageX;
      this.old_y = event['touches'][0].pageY;
      if (this.double_click == false) {
        this.double_click = true;
        setTimeout(function () { this.double_click = 0; }, 300);
        return false;
      }
      if (event['touches'].length == 1) this.touch_mode = false;
    }
    event.preventDefault();
    return false;
  }

  @HostListener('mouseup') onMouseUp() {
    this.drag = false;
  }

  @HostListener('mouseout') onMouseOut() {
    this.drag = false;
  }

  @HostListener('mousemove', ['$event']) onMousemove(event: MouseEvent) {
    if (!this.drag) return false;

    var new_x = event.pageX;
    var new_y = event.pageY;

    // For mobile
    if (event['touches']) {

      // 1 finger, touch_mode==0 : rotate
      // 1 finger, touch_mode==1 : move left/right, up/down
      // 2 fingers               : move in/out
      // 3 fingers               : reset view

      this.alt_key = false;
      this.ctrl_key = false;

      if (event['touches'].length > 2) {
        this.PHI = 0.0;
        this.THETA = 0.0;
        this.dX = 0;
        this.dY = 0;
        this.dKEYx = 0;
        this.dKEYy = 0;
        this.dKEYz = 0;
        this.eventsService.PHI$.next(this.PHI);
        this.eventsService.THETA$.next(this.THETA);
        this.eventsService.dKEYx$.next(this.dKEYx);
        this.eventsService.dKEYy$.next(this.dKEYy);
        this.eventsService.dKEYz$.next(this.dKEYz);
        event.preventDefault();
        return false;
      }
      this.using_touch = true;
      if (event['touches'].length == 2) {
        this.ctrl_key = true;
        var dx_touch = event['touches'][1].pageX - event['touches'][0].pageX;
        var dy_touch = event['touches'][1].pageY - event['touches'][0].pageY;
        var cur_dist = Math.sqrt(dx_touch * dx_touch + dy_touch * dy_touch);
      }
      else {
        if (this.touch_mode == true) this.alt_key = true;
      }
      new_x = event['touches'][0].pageX;
      new_y = event['touches'][0].pageY;
    }

    // Rotate only
    if (this.alt_key == false && this.ctrl_key == false) {
      this.dX = (new_x - this.old_x) * 2 * Math.PI / this.glS.canvasWidth;
      this.dY = (new_y - this.old_y) * 2 * Math.PI / this.glS.canvasHeight;

      this.THETA += this.dX;
      this.PHI += this.dY;
      this.eventsService.THETA$.next(this.THETA);
      this.eventsService.PHI$.next(this.PHI);
    }
    // Move only 
    else if (this.alt_key == true) {
      console.log('alt');
      if (this.touch_mode == true) {
        this.dX = (new_x - this.old_x) / this.glS.canvasWidth;
        this.dKEYx -= 3 * this.dX;
        this.eventsService.dKEYx$.next(this.dKEYx);
      }

      this.dY = (new_y - this.old_y) / this.glS.canvasHeight;
      this.dKEYz += 3 * this.dY;
      this.eventsService.dKEYz$.next(this.dKEYz);
    }
    // Zoom in / out
    else if (this.ctrl_key == true) {
      console.log('ctrl');
      if (this.using_touch == false) {
        this.dX = (new_x - this.old_x) / this.glS.canvasWidth,
        this.dKEYx -= 3 * this.dX;
        this.eventsService.dKEYx$.next(this.dKEYx);

        this.dY = (new_y - this.old_y) / this.glS.canvasHeight;
        this.dKEYy += 3 * this.dY;
        this.eventsService.dKEYy$.next(this.dKEYy);
      }
      else {
        if (this.prev_dist > 0) {
          this.dY = 3 * (cur_dist - this.prev_dist) / this.glS.canvasHeight;
          this.dKEYy -= this.dY;
          this.eventsService.dKEYy$.next(this.dKEYy);
        }
      }
      this.prev_dist = cur_dist;
    }

    this.old_x = new_x;
    this.old_y = new_y;
    event.preventDefault();
  }

  @HostListener('deviceorientation', ['$event']) handleOrientation(event: any) {
    // alpha angle about z axis
    // beta  angle about x axis
    // gamma angle about y axis
    this.PHI = event.beta * Math.PI / 180.0;
    this.eventsService.PHI$.next(this.PHI);
    this.THETA = event.gamma * Math.PI / 180.0;
    this.eventsService.THETA$.next(this.THETA);
  }

  /**
   * reset
   * @param option remove?
   */
  public reset(option) {
    this.eventsService.PHI$.next(0.0);
    this.eventsService.THETA$.next(0.0);
    this.eventsService.dX$.next(0);
    this.eventsService.dY$.next(0);
    this.eventsService.dKEYx$.next(0);
    this.eventsService.dKEYy$.next(0);
    this.eventsService.dKEYz$.next(0);
  }

}
