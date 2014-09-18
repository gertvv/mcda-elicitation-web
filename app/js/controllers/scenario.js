'use strict';
define(['angular', 'underscore', 'mcda/config'], function(angular, _, Config) {
  return function($scope, $location, $state, Tasks, TaskDependencies, ScenarioResource) {

    function randomId(size, prefix) {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (var i = 0; i < size; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return prefix ? prefix + text : text;
    }

    $scope.isEditTitleVisible = false;
    $scope.scenarioTitle = {};
    $scope.scenarios = ScenarioResource.query();
    $scope.scenario = ScenarioResource.get();

    $scope.tasks = _.reduce(Tasks.available, function(tasks, task) {
      tasks[task.id] = task;
      return tasks;
    }, {});

    var resultsAccessible = function() {
      var accessible = TaskDependencies.isAccessible($scope.tasks.results, $scope.scenario.state);
      return accessible.accessible;
    };

    $scope.resultsAccessible = resultsAccessible();

    $scope.$on('elicit.scenariosChanged', function() {
      $scope.scenarios = ScenarioResource.query();
      $scope.resultsAccessible = resultsAccessible();
    });

    var redirect = function(scenarioId) {
      $state.go(Config.defaultView, {
        scenarioId: scenarioId
      });
    };

    $scope.forkScenario = function() {
      var newScenario = {
        'title': randomId(3, 'Scenario '),
        'state': $scope.scenario.state
      };
      ScenarioResource.save(newScenario, function(savedScenario) {
        redirect(savedScenario.id);
      });
    };

    $scope.newScenario = function() {
      var newScenario = {
        'title': randomId(3, 'Scenario '),
        'state': {
          'problem': $scope.workspace.problem
        }
      };
      ScenarioResource.save(newScenario, function(savedScenario) {
        redirect(savedScenario.id);
      });
    };

    $scope.editTitle = function() {
      $scope.isEditTitleVisible = true;
      $scope.scenarioTitle.value = $scope.scenario.title;
    };

    $scope.saveTitle = function() {
      $scope.scenario.title = $scope.scenarioTitle.value;
      $scope.scenario.save();
      $scope.isEditTitleVisible = false;
    };

    $scope.cancelTitle = function() {
      $scope.isEditTitleVisible = false;
    };

    $scope.scenarioChanged = function(newScenario) {
      $state.go($scope.taskId, {
        scenarioId: newScenario.id
      });
    };
  };
});