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

myApp.service('checkSrv', function($http, $q){
	this.CheckPokemon = function (){
		var q = $q.defer();
		$http.get("http://127.0.0.1:5984/pokemon2/_all_docs")
		.then(function(data){
			var pokemonids = [];
			for (var i = 0; i < data.data.rows.length - 1; i++){
				pokemonids.push(data.data.rows[i].id) 
			}
			console.log("POKEMON IDS FOUND");
			console.log(pokemonids);
			q.resolve(pokemonids);
		}, function(err){ q.reject(err); });
		return q.promise;
	};
});

myApp.controller('homeCtrl', ['$scope', 'couchSrv', 'checkSrv', function($scope, couchSrv, checkSrv){
	$( document ).ready(function() {
		var pokemonIds = [];
		checkSrv.CheckPokemon().then(function(data){
			console.log("IN CHECKPOKEMON");
			pokemonIds = data;
		}, function(err){ console.log(err);})
		couchSrv.getObject().then(function(data){
			for (var i = 0; i < data.length; i++){
				if (!($.inArray(data[i].name, pokemonIds))){
				couchSrv.setObject(data[i].name, data[i]);
				}
			}
		}, function(err){
			console.log(err);
		});
	});
}]);