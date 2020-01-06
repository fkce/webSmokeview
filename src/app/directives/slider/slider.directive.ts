import { Directive, HostListener, ElementRef, AfterViewInit } from '@angular/core';
import { PlayerService } from 'src/app/services/player/player.service';
import { SliceService } from 'src/app/services/slice/slice.service';

@Directive({
  selector: '[slider]'
})
export class SliderDirective implements AfterViewInit {

  @HostListener('click', ['$event'])
  onClick(event) {

  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.playerService.sliderWidth = this.el.nativeElement.offsetWidth;
  }

  constructor(
    private el: ElementRef,
    private playerService: PlayerService,
    private sliceService: SliceService
  ) { }

  ngAfterViewInit() {
    this.playerService.sliderWidth = this.el.nativeElement.offsetWidth;
    console.log(this.el.nativeElement.offsetWidth);
  }
}
