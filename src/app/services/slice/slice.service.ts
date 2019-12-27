import { Injectable } from '@angular/core';
import { GlService } from '../gl/gl.service';
import { shaders as Shaders } from '../../consts/shaders';

@Injectable({
  providedIn: 'root'
})
export class SliceService {


  show_cen: boolean = false;


  cen_file_ready: boolean = true;

  cell_file = "smokeview.htmld";
  geom_file = "smokeview.htmld";


  constructor(
    private glS: GlService
  ) { }








}
