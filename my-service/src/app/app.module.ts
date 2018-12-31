import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { NewCmpComponent } from './new-cmp/new-cmp.component';
import { Routes, RouterModule} from '@angular/router';

import { MyserviceService } from "./myservice.service";

const routes: Routes = [
    {path: 'search', component: AppComponent, pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    NewCmpComponent
  ],
  imports: [
    BrowserModule, HttpClientModule, RouterModule.forRoot(routes)
  ],
  providers: [MyserviceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
