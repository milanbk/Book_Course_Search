import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule} from '@angular/router';

import { AppComponent } from './app.component';
import { RadiusSearchComponent } from './radius-search/radius-search.component';

const routes: Routes = [
    {path: 'radiussearch', component: AppComponent, pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    RadiusSearchComponent
  ],
  imports: [
    BrowserModule, HttpClientModule, RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
