import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpManagerService } from './services/http-manager/http-manager.service';
import { HttpManagerInterceptor } from './services/http-manager/http-manager.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SmokeviewComponent } from './views/smokeview/smokeview.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { SliderDirective } from './directives/slider/slider.directive';

@NgModule({
  declarations: [
    AppComponent,
    SmokeviewComponent,
    SliderDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSliderModule
  ],
  providers: [
    HttpManagerService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpManagerInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
