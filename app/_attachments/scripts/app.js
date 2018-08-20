var myApp = angular.module('myApp', ['ngRoute']);

myApp.config(function ($routeProvider){
	
	$routeProvider
	.when('/home', {
		templateUrl: 'assets/views/home.html',
		controller: 'homeCtrl'
	})
	.otherwise({redirectTo:'/home'});
	
});

myApp.service("couchSrv", function($http, $q){
	this.setObject = function(key, value){
		$http.put('../../' + key, value);
	};
	
	this.getObject = function(){
		var q = $q.defer();
		$http.get("http://127.0.0.1:5984/pokemonjson/c6ad4a0a486c2f807fbb5d5133002b95")
		.then(function (data){
			console.log(data);
			console.log(data.data.pokemon.docs.length);
			var pokemons = [];
			for (var i = 0; i < data.data.pokemon.docs.length; i++){
				pokemons.push(data.data.pokemon.docs[i]);
			}
			console.log("POKEMONS");
			console.log(pokemons);
			console.log(pokemons[0].name);
			q.resolve(pokemons);
		}, function(err){ q.reject(err);
		});
		return q.promise;
	};
});
myApp.controller('homeCtrl', ['$scope', 'couchSrv', function($scope, couchSrv){
	$( document ).ready(function() {
		couchSrv.getObject().then(function(data){
			for (var i = 0; i < data.length; i++){
				couchSrv.setObject(data[i].name, data[i]);
			}
			var testdate = data[0].owned;
			console.log(testdate);
			testdate = new Date(testdate);
			console.log(testdate);
		}, function(err){
			console.log(err);
		});
	});
}]);