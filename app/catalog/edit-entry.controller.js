angular.module('arachne.controllers')

    .controller('EditEntryController', ['$scope',
        function ($scope) {
            this.editState = 0; //0 = edit single entry, 1 = edit multiple entries, 2 = import via entity id
            $scope.entityIdString = undefined;
            $scope.newEntries = [{
                index: 0,
                label: '',
                entity: undefined
            }];

            $scope.addEntry = function (newEntry, entity) {
                $scope.newEntries.unshift({index: $scope.newEntries.length, entry: newEntry.label, entity: entity});
            };

            $scope.removeEntry = function (removeEntry) {
                $scope.newEntries = $scope.newEntries.filter(function (item) {
                    return item.index !== removeEntry.index;
                });
                for (var i = 0; i < $scope.newEntries.length; i++) {
                    $scope.newEntries[i].index = i;
                }
            };

            $scope.checkDisabled = function () {
                for (var i = 0; i < $scope.newEntries.length; i++)
                    if (($scope.newEntries[i].label !== undefined && $scope.newEntries[i].label !== '') || $scope.newEntries[i].entity !== undefined)
                        return false;
                return true;
            };

            $scope.returnArrayWithoutEmpty = function () {
                var returnArray = [];
                for (var i = 0; i < $scope.newEntries.length; i++)
                    if (($scope.newEntries[i].label !== undefined && $scope.newEntries[i].label !== '') || $scope.newEntries[i].entity !== undefined)
                        returnArray.push($scope.newEntries[i]);
                return returnArray;
            };

            $scope.returnArrayFromField = function (string) {
                var returnArray = [];
                var stringArray = string.split(',');
                for (var i = 0; i < stringArray.length; i++)
                    returnArray.push(stringArray[i]);
                return returnArray;
            };

            this.setState = function (state) {
                this.editState = state;
            };

            this.state = function (state) {
                return (this.editState === state);
            };
        }
    ]);