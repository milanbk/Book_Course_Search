import { Component, OnInit } from '@angular/core';
require('aws-sdk');
import * as AWS from 'aws-sdk';
import * as CloudSearchDomain from 'aws-sdk/clients/cloudsearchdomain';
declare var require: any
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {

  formdata: any;
  newjsondata: any;
  deletejsondata;

  constructor(private httpService: HttpClient) { }

  ngOnInit() {

  }

  onClickAdd(data) {
    this.formdata = data;

    //alert("Entered Title : " + data.title);
    console.log("Add new book");
    console.log(this.formdata);

    var inputtext = this.formdata.addressline1 + " "
    this.formdata.addressline2 + " "
    this.formdata.addresscity + " "
    this.formdata.addresszip;

    //Invoke google API to fetch lat-lon from given address - api key is required
    let url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + inputtext + "+64&key=AIzaSyBZs6hCYNY3GdZ07rUzL8MMp3hJcEuHInA";
    // console.log("url: ", url);

    this.httpService.get(url).toPromise().then(
      data => {
        var newid = "uu" + Math.floor(Math.random() * 10000000);

        var addressdata = JSON.stringify(data);

        var retdata = JSON.parse(addressdata);

        console.log("fetch lat-lon data:");
        console.log(retdata["results"][0]["formatted_address"]);
        var location = retdata["results"][0]["geometry"]["location"]["lat"] +
          "," + retdata["results"][0]["geometry"]["location"]["lng"];

        this.newjsondata = [{
          "fields": {
            "location": location,
            "author": this.formdata.author,
            "cover": this.formdata.cover,
            "year": this.formdata.year,
            "title": this.formdata.title
          },
          "id": newid,
          "type": "add"
        }];

        console.log(this.newjsondata);
    
        this.add_CORS();
        this.config_AWS();
        this.add_to_s3_cloudsearch();
      },
      (err: HttpErrorResponse) => {
        console.log(err.message);
      }
    );
  }

  onClickRemove(data) {
    this.formdata = data;
    //alert("Entered Title : " + data.title);
    console.log("Remove existing book");
    console.log(this.formdata);
    
    this.deletejsondata = {
      "fields":
      {
        "author": this.formdata.author,
        "cover": this.formdata.cover,
        "year": this.formdata.year,
        "title": this.formdata.title
      }
    };

    this.add_CORS();
    this.config_AWS();
    this.delete_from_s3_cloudsearch(this.deletejsondata.fields);
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
  }

  //Configure AWS with credentials to get access to aws apis
  config_AWS() {
    AWS.config.update({ accessKeyId: 'AKIAJMMFSVVRZC2KGDXA', secretAccessKey: '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' });
    AWS.config.update({ region: 'us-west-2' }); // say US West (Oregon)	us-west-2    
  }

  //Fetch json file from S3, update and upload the same to the bucket
  //Add to cloudsearch domain
  add_to_s3_cloudsearch() {
    // Create S3 service object
    var awss3;
    awss3 = new AWS.S3({ apiVersion: '2006-03-01' });

    var jsondata: string;

    //get existing object
    var params1 = {
      Bucket: "appsolzone",
      Key: "books_list.json"
    };

    var temp = JSON.stringify(this.newjsondata);

    awss3.getObject(params1, function (err, data) {
      if (err) {
        //this is the case when there is no existing json file
        console.log("New json file to be added"); // an error occurred

        var add_json_to_s3_bucket = function () {
          //put new object
          var params2 = {
            Body: temp,
            Bucket: "appsolzone",
            Key: "books_list.json"
          };

          awss3.putObject(params2, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
              //If putObject is successful, then we'll upload documents to cloudsearch
              console.log("putObject successful");
              console.log(data);           // successful response

              //Upload the updated json in cloudsearch domain
              var update_cloudsearch = function () {
                //cloud search domain:- books
                var csd = new CloudSearchDomain({ endpoint: 'search-books-goxinz5sozkgleg5e6aqr5y4ca.us-west-2.cloudsearch.amazonaws.com' });

                var params2 = {
                  contentType: "application/json", /* required */
                  documents: temp /* required */
                };
                csd.uploadDocuments(params2, function (err, data) {
                  if (err) console.log(err, err.stack); // an error occurred
                  else console.log(data);           // successful response
                });
              }
              update_cloudsearch();
            }
          });
        }
        add_json_to_s3_bucket();
      }
      else {

        //If getObject is succesful, we'll perform next actions
        jsondata = data.Body.toString();
        console.log("getObject successful");
        console.log(jsondata);           // successful response

        var rs1 = JSON.parse(jsondata);
        var rs2 = JSON.parse(temp);
        var result = rs1.concat(rs2);
        result = JSON.stringify(result);

        console.log(result);

        var delete_json_from_s3_bucket = function () {
          var params = {
            Bucket: "appsolzone",
            Key: "books_list.json"
          };
          awss3.deleteObject(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {

              //If deleteObject is successful, then we'll perform next actions
              console.log("deleteObject successful");
              console.log(data);           // successful response

              var add_json_to_s3_bucket = function () {
                //put new object
                var params2 = {
                  Body: result,
                  Bucket: "appsolzone",
                  Key: "books_list.json"
                };

                awss3.putObject(params2, function (err, data) {
                  if (err) console.log(err, err.stack); // an error occurred
                  else {
                    //If putObject is successful, then we'll upload documents to cloudsearch
                    console.log("putObject successful");
                    console.log(data);           // successful response

                    //Upload the updated json in cloudsearch domain
                    var update_cloudsearch = function () {
                      //cloud search domain:- books
                      var csd = new CloudSearchDomain({ endpoint: 'search-books-goxinz5sozkgleg5e6aqr5y4ca.us-west-2.cloudsearch.amazonaws.com' });

                      var params2 = {
                        contentType: "application/json", /* required */
                        documents: result /* required */
                      };
                      console.log(params2);
                      csd.uploadDocuments(params2, function (err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else console.log(data);           // successful response
                      });
                    }
                    update_cloudsearch();
                  }
                });
              }
              add_json_to_s3_bucket();
            }
          });
        }
        delete_json_from_s3_bucket();
      }
    });
  }

  //Fetch json file from S3, update and upload the same to the bucket
  //Delete from cloudsearch domain
  delete_from_s3_cloudsearch(tempdata) {
    // Create S3 service object
    var awss3;
    awss3 = new AWS.S3({ apiVersion: '2006-03-01' });

    var jsondata: string;

    //get existing object
    var params1 = {
      Bucket: "appsolzone",
      Key: "books_list.json"
    };

    var temp = JSON.stringify(this.deletejsondata.fields);

    awss3.getObject(params1, function (err, data) {
      if (err) {
        //this is the case when there is no existing json file
        console.log("There is no existing json file"); // an error occurred
      }
      else {
        //If getObject is succesful, we'll perform next actions
        jsondata = data.Body.toString();
        console.log("getObject successful");
        console.log(jsondata);           // successful response

        var rs1 = JSON.parse(jsondata);
        var indices = [];

        for (var i in rs1) {
          for (var j in rs1[i]) {
            if (j == "fields") {
              if (rs1[i][j].author == tempdata.author &&
                rs1[i][j].cover == tempdata.cover &&
                rs1[i][j].year == tempdata.year &&
                rs1[i][j].title == tempdata.title)
                indices.push(i);
            }
          }
        }
        console.log(indices);

        for (var index = indices.length -1; index >= 0; index--)
           rs1.splice(indices[index],1);

        var result = JSON.stringify(rs1);

        console.log(result);

        var delete_json_from_s3_bucket = function () {
          var params = {
            Bucket: "appsolzone",
            Key: "books_list.json"
          };
          awss3.deleteObject(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {

              //If deleteObject is successful, then we'll perform next actions
              console.log("deleteObject successful");
              console.log(data);           // successful response

              var add_json_to_s3_bucket = function () {
                //put new object
                var params2 = {
                  Body: result,
                  Bucket: "appsolzone",
                  Key: "books_list.json"
                };

                awss3.putObject(params2, function (err, data) {
                  if (err) console.log(err, err.stack); // an error occurred
                  else {
                    //If putObject is successful, then we'll upload documents to cloudsearch
                    console.log("putObject successful");
                    console.log(data);           // successful response

                    //Upload the updated json in cloudsearch domain
                    var update_cloudsearch = function () {
                      //cloud search domain:- books
                      var csd = new CloudSearchDomain({ endpoint: 'search-books-goxinz5sozkgleg5e6aqr5y4ca.us-west-2.cloudsearch.amazonaws.com' });

                      var params2 = {
                        contentType: "application/json", /* required */
                        documents: result /* required */
                      };
                      csd.uploadDocuments(params2, function (err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else console.log(data);           // successful response
                      });
                    }
                    update_cloudsearch();
                  }
                });
              }
              add_json_to_s3_bucket();
            }
          });
        }
        delete_json_from_s3_bucket();
      }
    });
  }
}
