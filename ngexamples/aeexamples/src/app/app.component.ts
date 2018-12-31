import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'aeexamples';
  // declared array of months.
  months = ["January", "Feburary", "March", "April", "May", 
  "June", "July", "August", "September",
  "Octobor", "November", "December"];
  isavailable = true;   //variable is set to true
}
