import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PartService {

  buffer_vertices_part = null;
  buffer_colors_part = null;
  buffer_indices_part = null;

  file_ready: boolean = true;

  vertices_data = [
    0.0, 1.0, 0.75,
    0.25, 0.75, 0.75,
    0.5, 0.5, 0.75,
    0.75, 0.25, 0.75,
    1.0, 0.0, 0.75,
    0.0, 1.0, 1.0,
    0.25, 0.75, 1.0,
    0.5, 0.5, 1.0,
    0.75, 0.25, 1.0,
    1.0, 0.0, 1.0
  ];

  colors_data = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
    1, 1, 0,
    0, 0, 1,
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
    1, 1, 0,
    0, 0, 1
  ];

  // offsets for each particle frame
  offsets = [
    0, 5
  ];

  // size of each particle frame
  sizes = [
    5, 5
  ];

  vertices = [
    0.0, 1.0, 0.75, 0.25, 0.75, 0.75, 0.5, 0.5, 0.75, 0.75, 0.25, 0.75, 1.0, 0.0, 0.75
  ];

  colors = [
    1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1
  ];

  // must be at least as large as largest particle frame
  indices = [
    0, 1, 2, 3, 4
  ];


  constructor() { }
}
