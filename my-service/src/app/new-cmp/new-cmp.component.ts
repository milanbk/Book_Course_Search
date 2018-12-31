import { Component, OnInit } from '@angular/core';
import { MyserviceService } from './../myservice.service';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { delay} from "rxjs/operators";

import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-new-cmp',
  templateUrl: './new-cmp.component.html',
  styleUrls: ['./new-cmp.component.css']
})
export class NewCmpComponent implements OnInit {

  todaydate;
  servicetext;
  servicemonths;
  searchkeyword;

  details: Observable<any[]>;
  columns: string[];
  newData: any;
  courseraData: any;
  edxData: any;
  udemyData: any;
  params: any;

  newcomponent = "Entered in new component created";
  constructor(private myservice: MyserviceService, private httpService: HttpClient,
    private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.todaydate = this.myservice.showTodayDate();
    this.servicetext = this.myservice.service_text;
    this.servicemonths = this.myservice.months;

    this.searchkeyword = this.myservice.search_keyword;

    this.columns = this.getColumns();
    this.details = this.getDetails();

    //Fetch courses
    // this.fetch_coursera_data();
    // this.fetch_edx_data();
    // this.fetch_udemy_data();

    // This would print out the json object which contained
    // all of our query parameters for this particular route.
    this.route.queryParams.subscribe(params => {
      console.log("Inside queryParams.subscribe");
      this.params = params;

      if (this.params['lat'] != null && this.params['lon'] != null && this.params['radius'] != null) {
        this.radius_based_search();
      }
    })
    
    // this.myservice.config_AWS();
    // this.myservice.s3_bucket_test();
    // this.myservice.cloudsearch_test();
    // this.myservice.cloudsearch_domain_test();
  }

  radius_based_search() {
    // var centre = { latitude: 22.58796393, longitude: 88.42647098 } //Appsolzone office
    // var radius = 3; // in kms

    //AWS APIs
    this.myservice.add_CORS();
  
    var centre = { latitude: this.params["lat"], longitude: this.params["lon"] } //Appsolzone office
    var radius = this.params["radius"]; // in kms

    this.getPointsInCircle(centre, radius);
  }

  getDetails(): Observable<any[]> {
    return of(this.myservice.courses).pipe(delay(100));
  }

  getColumns(): string[] {
    return ["title", "level", "domain", "language"]
  };

  //Make http call to the cloudsearch url to fetch the points present inside circle
  getPointsInCircle(centre, radius) {
    //Calculate bounding rectangle co-ordinates
    const geolib = require("geolib")
    var dist = radius * 1000; // in meters
    var bearing = 45; //in degree

    //(Attention: this formula is not 100% accurate (but very close though))
    var destPoint = geolib.computeDestinationPoint(centre, dist, bearing);
    console.log("centre: ", centre);
    var latoffset = destPoint.latitude - centre.latitude;
    var lonoffset = destPoint.longitude - centre.longitude;

    var topleftPoint = { lat: centre.latitude - latoffset, lon: destPoint.longitude }
    var rightbottomPoint = { lat: destPoint.latitude, lon: centre.longitude - lonoffset }

    var boundinglocation = "['" +
      rightbottomPoint.lat + "," +
      rightbottomPoint.lon + "','" +
      topleftPoint.lat + "," +
      topleftPoint.lon + "']";
    console.log("boundinglocation: ", boundinglocation);
    console.log("radius(kms): ", radius);

    //Form URL with query, expressions, sort, filter query, return parameters
    var search_endpoint = "search-locations-l2lfxzmlf4zk7sxrxvezki3nye.us-west-2.cloudsearch.amazonaws.com";
    var search_text = 'block';
    let url = "http://" + search_endpoint + "/2013-01-01/search?" +
      "q=%27" + search_text + "%27" +
      "&expr.distance=haversin(" + centre.latitude + "," + centre.longitude + ",location.latitude,location.longitude)" +
      "&expr.radius=" + radius +
      "&expr.offset=(distance-" + radius + ")" +
      "&fq=location:" + boundinglocation +
      "&sort=distance%20asc" +
      "&return=offset,radius,distance,_all_fields" +
      "&size=25";
    //console.log("url: ", url);

    var result = []

    //Check for data present inside the circle 
    //geolib.isPointInCircle(object latlng, object center, integer radius)
    this.httpService.get(url).toPromise().then(
      data => {
        this.newData = JSON.stringify(data);

        this.newData = JSON.parse(this.newData);

        console.log("fetch cloudsearch data:");
        for (var i in this.newData) {
          if (i == "hits")
            for (var j in this.newData[i]) {
              if (j == "hit")
                for (var k in this.newData[i][j]) {
                  if (this.newData[i][j][k].exprs.offset <= 0) {
                    console.log(this.newData[i][j][k]);
                    result.push(this.newData[i][j][k]);
                  }
                }
            }
        }
        console.log(result);
      },
      (err: HttpErrorResponse) => {
        console.log(err.message);
      }
    );
  }

  fetch_coursera_data() {
    //https://www.coursera.org/courses?query=angularjs
    this.httpService.get('./assets/coursera.json').toPromise().then(
      data => {
        this.courseraData = JSON.stringify(data);
        this.courseraData = JSON.parse(this.courseraData);

        console.log("fetch_coursera_data ", this.courseraData);
      },
      (err: HttpErrorResponse) => {
        console.log(err.message);
      }
    );
  }

  fetch_edx_data() {
    //https://www.edx.org/course?search_query=angularjs
    this.httpService.get('./assets/edx.json').toPromise().then(
      data => {
        this.edxData = JSON.stringify(data);
        this.edxData = JSON.parse(this.edxData);

        console.log("fetch_edx_data ", this.edxData);
      },
      (err: HttpErrorResponse) => {
        console.log(err.message);
      }
    );
  }

  fetch_udemy_data() {
    //https://www.udemy.com/courses/search/?src=ukw&q=angularjs
    this.httpService.get('./assets/udemy.json').toPromise().then(
      data => {
        this.udemyData = JSON.stringify(data);
        this.udemyData = JSON.parse(this.udemyData);

        console.log("fetch_udemy_data ", this.udemyData);
      },
      (err: HttpErrorResponse) => {
        console.log(err.message);
      }
    );
  }
}