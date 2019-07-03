/*var app = angular
  .module('myapp', [
    'ngRoute'
  ]);
*/


var app = angular.module('myapp', ['ngRoute','ui.router']);


/* Definindo Rotas*/
app.config(function($routeProvider, $locationProvider){
  $routeProvider
    .when("/", {
        templateUrl : 'pages/home.html',
        controller: 'HomeController'
    })
    .when('/table', {
      templateUrl: 'pages/table.html',
      controller: 'UserCRUDCtrl'
    })
    .otherwise({redirectTo: '/'});
});



app.controller('HomeController', function($scope, $location, fileUpload) {
  $scope.login = function(cnpj) {
    if(cnpj==null || cnpj==''){
      alert('Informe um CNPJ para pesquisa');
      $location.path('/');
    }
    else{$location.path('/table').search('param', cnpj);}
    
  } 
  $scope.go = function(path){
    $location.path(path);
  }
});

app.controller('HomeControllerBarNav', function($scope, $location) {
  $scope.home = function() {
    $location.path('/');
  }
});

app.controller('UserCRUDCtrl', ['$scope','UserCRUDService', '$location', function ($scope,  UserCRUDService, $location ) {
  $scope.carregando = true; // Show loading image      
	$scope.init = function () {
    var parametroCnpj = ($location.search().param);
    var inputConsulta;
    if(typeof parametroCnpj === 'string'){
      inputConsulta = [parametroCnpj];
      //alert(1)
    }else{
      inputConsulta = parametroCnpj.listaCnpj;
      //alert(2)
    }
   
      UserCRUDService.consulta(inputConsulta).then(function success(response){  
          
          $scope.cnpjList = response.data;
          $scope.carregando = false;
          //$scope.cnpjConsultado = response.data.cnpj;
          //$scope.nomeConsultado = response.data.companyName;
          //$scope.cidadeConsultado = response.data.cidade;
          //$scope.cnaes = response.data.cnaes;
          //$scope.alt = response.data.alt;
          $scope.message='';
          $scope.errorMessage = '';
      },
      function error (response ){
            $scope.message='ERRRRO';
            $scope.errorMessage = 'Error ao consultar';
      });
  }

}])

app.service('UserCRUDService',['$http', function ($http) {
	
  this.consulta = function (cnpjParametro){
      //alert(cnpjParametro);
      var texto = cnpjParametro;
      var json = {"listaCnpj": texto};
      return $http({
        method: 'POST',
        //url:'http://localhost:8081/processarCNAE',
        url:'https://app-cane.herokuapp.com/processarCNAE',
        data: json
      });
    
  }
}]);


app.directive('fileModel', ['$parse', function ($parse) {
  return {
     restrict: 'A',
     link: function(scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;
        element.bind('change', function(){
           scope.$apply(function(){
              modelSetter(scope, element[0].files[0]);
           });
        });
     }
  };
}]);

app.service('fileUpload', ['$http','$location', function ($http, $location) {
  this.uploadFileToUrl = function(file, uploadUrl){
     var fd = new FormData();
     fd.append('file', file); 
    

     if(file==null){
      alert('Favor selecionar uma planilha válida');
      return;
     } 
     $http.post(uploadUrl, fd, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
     }).success(function(response){
     
       $location.path('/table').search('param', response);     
     })
     .error(function(response){
       alert('Não foi possível validar a planilha informada. Contactar rianmachado@gmail.com');
     });
  }
}]);

app.controller('fileCtrl', ['$scope', 'fileUpload', function($scope, fileUpload){
  $scope.uploadFile = function(){
     var file = $scope.myFile;
     //var uploadUrl = "http://localhost:8081/upload";
     var uploadUrl = "https://app-cane.herokuapp.com/upload";
     fileUpload.uploadFileToUrl(file, uploadUrl);
  };
}]);
