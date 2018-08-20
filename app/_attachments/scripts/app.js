var myApp = angular.module('myApp', ['ngRoute']);

myApp.config(function ($routeProvider){
	
	$routeProvider
	.when('/home', {
		templateUrl: 'assets/views/home.html',
		controller: 'homeCtrl'
	})
	.otherwise({redirectTo:'/home'});
	
});

//DEZE SERVICE SAVED EN HAALT BESTANDEN VAN COUCHDB (SPECIFIEK UIT DATABASE pokemonjson)
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
			q.resolve(pokemons);
		}, function(err){ q.reject(err);
		});
		return q.promise;
	};
});

//DEZE SERVICE CHECKT OF DE POKEMONS AL NIET BESTAAN, ANDERS ZOU MEN HEEL DE TIJD ERRORS KRIJGEN
//AANGEZIEN MEN EEN OBJECT PROBEERT AAN TE MAKEN MET EEN ID DAT AL BESTAAT.
//NIEUWE POKEMONS ZULLEN TOEGEVOEGD WORDEN. DE REEDS BESTAANDE WORDEN GENEGEERD. 
myApp.service('checkSrv', function($http, $q){
	this.CheckPokemon = function (){
		var q = $q.defer();
		$http.get("http://127.0.0.1:5984/pokemon2/_all_docs")
		.then(function(data){
			var pokemonids = [];
			for (var i = 0; i < data.data.rows.length - 1; i++){
				pokemonids.push(data.data.rows[i].id) 
			}
			q.resolve(pokemonids);
		}, function(err){ q.reject(err); });
		return q.promise;
	};
});

//DEZE SERVICE ZOEKT A.D.H.V. DE VIEW ALLE RESULTATEN OP TUSSEN 2 DATUMS 
myApp.service('viewSrv', function($http, $q){
	this.viewSearch = function(key, key2){
		var q = $q.defer();
		var searchResult = [];
		var url = "127.0.0.1:5984/pokemon2/_design/app/_view/byname?";
		var keyurl = url + 'startkey="' + key + '"&endkey="' + key2 + '"';
		$http.get(url).then(function(data){
			for (var i = 0; i < data.data.rows.length; i++){
				searchResult.push(data.data.rows[i]);
			}
			q.resolve(searchResult);
		}, function(err){ q.reject(err); })
		return q.promise;
	};
});

myApp.controller('homeCtrl', ['$scope', 'couchSrv', 'checkSrv', 'viewSrv', function($scope, couchSrv, checkSrv, viewSrv){
	//OPHALEN POKEMONS BIJ LADEN PAGINA
	$( document ).ready(function() {
		var pokemonIds = [];
		checkSrv.CheckPokemon().then(function(data){
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
	
	//ZOEKEN OP DATUMS
	$('#searchButton').on('click', function(e){
		var startDate = $("#firstDate").val();
		var endDate = $("#secondDate").val();
		viewSrv.viewSearch(startDate, endDate).then(function(data){
			$scope.result = data;
		}, function(err){ console.log(err); })
	})
}]);