import { Injectable } from '@angular/core';
import { Component } from '@angular/core';

require('aws-sdk');
import * as AWS from 'aws-sdk';
import * as CloudSearch from 'aws-sdk/clients/cloudsearch';
import * as CloudSearchDomain from 'aws-sdk/clients/cloudsearchdomain';

// declare const Buffer
@Injectable({
  providedIn: 'root'
})

export class MyserviceService {

  constructor() { }
  service_text = "Entered in new service created"

  // declared array of months.
  months = ["January", "Feburary", "March", "April", "May",
    "June", "July", "August", "September",
    "October", "November", "December"];

  showTodayDate() {
    let ndate = new Date();
    return ndate;
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

  //Configure AWS with credentials to get access to aws apis
  config_AWS() {
    AWS.config.update({ accessKeyId: 'AKIAJMMFSVVRZC2KGDXA', secretAccessKey: 'C7DJlc+36x8YKRK98bJ72AKP6ZO2tQ/EvSBTQ6aT' });
    AWS.config.update({ region: 'us-west-2' }); // say US West (Oregon)	us-west-2    
  }

  //Sample AWS S3 bucket API
  s3_bucket_test() {
    // Create the parameters for calling createBucket
    var bucketParams = {
      Bucket: 'appsolzone'
    };

    // Create S3 service object
    var awss3;
    awss3 = new AWS.S3({ apiVersion: '2006-03-01' });

    // Call S3 to create the bucket
    awss3.listObjects(bucketParams, function (err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("aws s3 bucket api:");
        console.log("Success", data);
      }
    });
  }

  //Sample AWS Cloudsearch API
  cloudsearch_test() {
    //end point :- cloudsearch.us-west-2.amazonaws.com - Oregon    
    var cloudsearch = new CloudSearch({ apiVersion: '2013-01-01' });
    var params = {
      DomainNames: [
        'coursera-courses'
      ]
    };
    cloudsearch.describeDomains(params, function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else console.log(data);           // successful response
    });

    cloudsearch.listDomainNames(function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else { console.log("aws cloudsearch api:"); console.log(data); }           // successful response
    });
  }

  //Sample AWS CloudSearchDomain API
  cloudsearch_domain_test() {
    var csd = new CloudSearchDomain({ endpoint: 'search-coursera-courses-ttta3hjjy7jepitjpzvrt64ug4.us-west-2.cloudsearch.amazonaws.com' });
    var params = {
      query: 'English'
    };
    csd.search(params, function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else { console.log("aws cloudsearchdomain api:"); console.log(data); }           // successful response
    });
  }

  search_keyword = "angularjs"
  courses: any[] =
    [
      {
        title: 'Basic Programming in Angular 1',
        level: 'Beginner',
        domain: 'Engineering',
        language: 'Bengali'
      },
      {
        title: 'Basic Programming in Angular 2',
        level: 'Beginner',
        domain: 'Engineering',
        language: 'Hindi'
      },
      {
        title: 'Advanced Programming in Angular 4',
        level: 'Advanced',
        domain: 'Engineering',
        language: 'English'
      },
      {
        title: 'Expert Programming in Angular 6',
        level: 'Expert',
        domain: 'Engineering',
        language: 'English'
      }
    ]
}
