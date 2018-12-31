import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
declare var require: any
@Component({
  selector: 'app-radius-search',
  templateUrl: './radius-search.component.html',
  styleUrls: ['./radius-search.component.css']
})

export class RadiusSearchComponent implements OnInit {

  params: any;
  newData: any;
  
  constructor(private httpService: HttpClient, private route: ActivatedRoute) { }

  ngOnInit() {
    // Input url example -> http://localhost:4200/radiussearch?lat=22.58796393&lon=88.42647098&radius=3
    // This would print out the json object which contained
    // all of our query parameters for this particular route.
    this.route.queryParams.subscribe(params => {
      console.log("Inside queryParams.subscribe");
      this.params = params;

      if (this.params['lat'] != null && this.params['lon'] != null && this.params['radius'] != null) {
        this.radius_based_search();
      }
    })    
  }

  radius_based_search() {
    // var centre = { latitude: 22.58796393, longitude: 88.42647098 } //Appsolzone office
    // var radius = 3; // in kms

    //AWS APIs
    this.add_CORS();
  
    var centre = { latitude: this.params["lat"], longitude: this.params["lon"] } //Appsolzone office
    var radius = this.params["radius"]; // in kms

    this.getPointsInCircle(centre, radius);
  }

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

  //This is required to unblock cloudsearch api calls from CORS policy
  add_CORS() {
    // const host = '127.0.0.1';
    // const port =  4200;

    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = window.location.protocol + '//' + window.location.host;
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
      var args = slice.call(arguments);
      var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
      if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
        targetOrigin[1] !== cors_api_host) {
        args[1] = cors_api_url + args[1];
      }
      return open.apply(this, args);
    };

    // const cors = require('cors'); //<-- required installing 'cors' (npm i cors --save)
    // const express = require('express');
    // const app = express();
    // app.use(cors()); //<-- That`s it, no more code needed!
  }
  
}
