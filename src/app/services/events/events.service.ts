import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  /*================= Events ======================*/
  drag = false;
  old_x = null;
  old_y = null;

  THETA$: BehaviorSubject<number> = new BehaviorSubject(0);
  PHI$: BehaviorSubject<number> = new BehaviorSubject(0);
  dKEYx$: BehaviorSubject<number> = new BehaviorSubject(0);
  dKEYy$: BehaviorSubject<number> = new BehaviorSubject(0);
  dKEYz$: BehaviorSubject<number> = new BehaviorSubject(0);
  dX$: BehaviorSubject<number> = new BehaviorSubject(0);
  dY$: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor() { }

}
