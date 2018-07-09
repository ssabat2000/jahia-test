var esHost = 'http://localhost:9200';
var esIndex = 'browser-events';
var documentType = 'click';

var MyApp = angular.module('MyApp', ['elasticsearch']);

MyApp.service('client', function (esFactory) {
	return esFactory({
		host: esHost,
        log: 'trace'
    });
});

MyApp.controller('myServerHealthController', function ($scope, client, esFactory) {		
	client.cluster.state({
		metric: [
			'cluster_name',
			'nodes',
			'master_node',
			'version'
        ]
	})
    .then(function (resp) {
		$scope.clusterInfo = resp;
        $scope.error = null;
    })
    .catch(function (err) {
        $scope.clusterInfo = null;
        $scope.error = err;
        if (err instanceof esFactory.errors.NoConnections) {
          $scope.error = new Error('Unable to connect to elasticsearch. ' +
            'Make sure that it is running and listening at http://localhost:9200');
        }
	});
})

MyApp.controller('myActionController', function($scope, client){
	$scope.addEvent = function () {
		$scope.actionResultAdd = '';
		var aDate = new Date(); 
		client.create ({
			index: esIndex,
			type: documentType,
			id: aDate.getTime(),
			body: {
				date: aDate.toUTCString(),
				agent: navigator.userAgent 
			}
		}, function (error, response) {
			if (error) {
				$scope.actionResultAdd = "Unable to create event.";
				console.error('Imposible to create event. The Error:' + error);
			} else {
				$scope.actionResultAdd = 'Event created.';
				console.log('Response:' + response.result + ', id=' + response._id);
			}
		});
	};
	
	$scope.searchEvent = function () {
		$scope.actionResultSearch = '';
		client.search({
			index: esIndex,
			q: 'agent:' + $scope.aSearchString,
			size: 1000
		}, function (error, response) {
			if (error) {
				$scope.actionResultSearch= 'Unable to retrieve data.';
				console.error('Unable to fetch data : ' + error);
			} else {
				$scope.actionResultSearch = 'Results found:' + response.hits.total;
				$scope.hits = response.hits.hits;
			}
		});
	};
});