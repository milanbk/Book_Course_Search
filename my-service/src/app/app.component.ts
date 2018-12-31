import { Component } from '@angular/core';
import { MyserviceService } from './myservice.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-service';
  todaydate;
  constructor(private myservice: MyserviceService) {}
  ngOnInit() {
     this.todaydate = this.myservice.showTodayDate();
  }
}
