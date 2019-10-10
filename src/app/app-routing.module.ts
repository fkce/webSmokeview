import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SmokeviewComponent } from './views/smokeview/smokeview.component';

const routes: Routes = [
  {
    path: '',
    component: SmokeviewComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
