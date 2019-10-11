import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LineService {

  buffer_vertices = null;
  buffer_colors = null;
  buffer_indices = null;

  vertices = [
    0, 0, 0, 0, 1, 1,
    0, 0, 0, 1, 0, 0
  ];

  colors = [
    1, 0, 0, 0, 1, 0,
    0, 0, 1, 1, 1, 0
  ];

  indices = [
    0, 1, 2, 3
  ];

  constructor() { }
}
