'use strict'; 

var httpFileExtMap = {
	pdf : 'application/pdf',
	doc : 'application/msword',
	docx : 'application/msword',
	zip : 'application/zip',
	jpg : 'image/jpeg',
	jpeg : 'image/jpeg',
	png : 'image/png',
	bmp : 'image/bmp',
	tiff: 'image/tiff',
	rtf : 'text/rtf',
	txt : 'text/plain',
	other: 'application/octet-stream'
}

exports.get = function(fileExtension) {
	var httpFileExt = httpFileExtMap[fileExtension];
	
	if(httpFileExt) {
		return httpFileExt;
	}
	else {
		return httpFileExtMap['other'];
	}
};