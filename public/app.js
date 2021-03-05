/// <reference path="../typings/tsd.d.ts" />

// MODULE
var blockciteApp = angular.module('blockciteApp', ['ngRoute', 'ngResource', 'ngFileUpload']);

blockciteApp.prefix = '';

blockciteApp.config(function ($routeProvider) {
	
	$routeProvider
		.when('/', {
			templateUrl: 'pages/home.html',
			controller: 'homeController'
		})
		.when('/cite', {
			templateUrl: 'pages/cite.html',
			controller: 'citeController'
		})
		.when('/login', {
			templateUrl: 'pages/login.html',
			controller: 'loginController'	
		})
		.when('/citesuccess', {
			templateUrl: 'pages/cite_success.html',
			controller: 'citeSuccessController'
		})
	
});

// SERVICES
blockciteApp.service('citeService', function() {
	this.data = '';
	this.files = '';
	this.accessToken = '';
	this.citingSuccessResp = '';
});


// CONTROLLERS
blockciteApp.controller('homeController', ['$scope', 'citeService', 'Upload', function($scope, citeService, Upload) {
	
	
	
}]);


blockciteApp.controller('loginController', ['$scope', '$http', '$location','citeService', function($scope, $http, $location, citeService) {
	
	$scope.login = function() {
		$http.post('/users/login', {email: $scope.loginEmail, password: $scope.loginPassword})
			 .success(function(data, status, headers, config) {
				 citeService.accessToken = data['x-access-token'];
				 $location.path('/cite');
			 })
			 .error(function(data, status, headers, config) {
				 console.log(data);
			 });
	}
	
}]);


blockciteApp.controller('citeController', ['$scope', '$http', '$location', 'citeService', 'Upload', function($scope, $http, $location, citeService, Upload) {
		
	$scope.$watch('files', function() {
		if($scope.files) {
			
			// Show confirm light box
			
			//$('#showModalBtn').click();
			$('#confirmModal').modal('show');
			
		}
	});
	
	$scope.cite = function() {
		
		$('#confirmModal').modal('hide');
		//$('#spinnerModal').modal('show');
		
		$.blockUI(
			{
				message:  '<div class="progress"><div>Loading…</div></div>',
				css:{border: 'none', backgroundColor: 'none'}
			}
		);
		
		if(!citeService.accessToken) {
			console.log('Not login');
			return;
		}
		
		var files = $scope.files;
		
		if(files && files.length) {
		
			var file = files[0];	
			var reader = new FileReader();
			var fileHash;
			
			async.series([
				function(callback) {
					reader.onloadend = function(e) {
						if(e.target.readyState === FileReader.DONE) {
							var bytes = CryptoJS.lib.WordArray.create(e.target.result);
							var sha256 = CryptoJS.algo.SHA256.create();
							sha256.update(bytes);
							fileHash = sha256.finalize().toString();
						}
						callback();
					};
					
					var blob = file.slice(0, file.size);
					reader.readAsArrayBuffer(blob);
				}
			],
			function() {
				if(fileHash) {
					Upload.upload({
						url: '/cite',
						headers: {"x-access-token" : citeService.accessToken},
	                    fields: {"citing_data": blockciteApp.prefix + fileHash, "is_hex": true},
	                    file: file
					}).progress(function(evt) {
						var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	        			console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
					}).success(function(data, status, headers, config) {
						
						console.log('file ' + config.file.name + 'uploaded. '); 
						console.log(data);
						citeService.citingSuccessResp = data;
						$.unblockUI();
						$location.path('/citesuccess');
						
					});
				}
			});
			
		}
	}
	
}]);

blockciteApp.controller('citeSuccessController', ['$scope', '$http', 'citeService', function($scope, $http, citeService) {
	
	console.log(citeService.authors);
	$scope.authors = citeService.citingSuccessResp.authors;
	$scope.blockchain_txn = citeService.citingSuccessResp.blockchain_txn;
	$scope.cited_time = citeService.citingSuccessResp.cited_time;
	$scope.citing_data = citeService.citingSuccessResp.citing_data;
	$scope.file_name = citeService.citingSuccessResp.file_name;
	$scope.owner = citeService.citingSuccessResp.owner;
	
	
}]);
