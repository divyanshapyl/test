const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminGiflossy = require('imagemin-giflossy');
const imageminSvgo = require('imagemin-svgo');

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs');

var prevOperations = [];

exports.handler = function(event, context){
let flag = false;
var srcBucket = event.Records[0].s3.bucket.name;
// Object key may have spaces or unicode non-ASCII characters.
var srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

var params = {Bucket: srcBucket, Key: srcKey}; //source
var putparams = {Bucket: 'ziqqi-media-uat', Key: srcKey}; //destination

s3.getObject(params, function(err, data){
	if(err){
		console.log(err);
		return 0;
	}
//imagemin([array of file paths], destination folder, OPTIONS).then(function(){});
	console.log("Optimizing file....", params, ' .... Start!');

	imagemin.buffer(data.Body,{
		plugins: [
			imageminMozjpeg({quality: '85'}),
			imageminPngquant({quality: '85'}),
			imageminGiflossy({lossy: 80}),
			imageminSvgo()

		],
		use:[
			imageminMozjpeg(), imageminPngquant(), imageminGiflossy(), imageminSvgo()
		]
	}).then(function(files){
		console.log("Optimizing file....", params, ' .... done!');
		console.log("Now writing files to s3 bucket");
		putparams.Body = files;
		s3.putObject(putparams, function(err){
			if(err)
				console.log("file write error ",err);
			else
				console.log("success");
		});
	});
	});
};
