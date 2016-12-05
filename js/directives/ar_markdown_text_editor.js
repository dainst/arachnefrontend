'use strict';

angular.module('arachne.directives')

/**
 * @author: Thomas Kleinke
 */
.directive('arMarkdownTextEditor', ['$timeout', '$uibModal', function($timeout, $uibModal) {
    return {
        restrict: 'A',
        scope: {
            markdownText: '=',
            placeholder: '@'
        },
        templateUrl: 'js/directives/ar-markdown-text-editor.html',
        link: function(scope, element) {
            var textField = angular.element(element.children()[0]).children()[1];

            if (!scope.markdownText)
                scope.markdownText = "";

            scope.formatText = function(formatOption) {
                var selectedText;
                var selectedTextStart;
                var selectedTextEnd;
                var selectionRange;
                
                if (document.selection != undefined) {
                    textField.focus();
                    selectionRange = document.selection.createRange().duplicate();
                    selectedText = selectionRange.text;

                    var textFieldRange = textField.createTextRange();
                    var bookmark = selectionRange.getBookmark();

                    textFieldRange.moveToBookmark(bookmark);
                } else if (textField.selectionStart != undefined) {
                    selectedTextStart = textField.selectionStart;
                    selectedTextEnd = textField.selectionEnd;
                    selectedText = scope.markdownText.substring(selectedTextStart, selectedTextEnd);
                }

                var modifiedText = "";
                var additionalCharacters = 0;

                if (formatOption == "link") {
                    var link = { description: selectedText };
                    var addLinkModal = $uibModal.open({
                        templateUrl: 'js/Modals/addMarkdownLink.html',
                        controller: 'AddMarkdownLinkController',
                        resolve: { link: function() { return link; } }
                    });
                    addLinkModal.close = function(link) {
                        modifiedText = "[" + link.description + "](" + link.url + ")";
                        additionalCharacters = (link.description.length - selectedText.length) + link.url.length + 4;
                        updateSelection(modifiedText, selectionRange, selectedTextStart, selectedTextEnd, additionalCharacters, false);
                        addLinkModal.dismiss();
                    };
                } else {
                    var blankSpaceSelection = false;

                    switch (formatOption) {
                        case "bold":
                            if (selectedText == "") {
                                selectedText = " ";
                                additionalCharacters = 2;
                                blankSpaceSelection = true;
                            } else
                                additionalCharacters = 4;
                            modifiedText = "**" + selectedText + "**";
                            break;

                        case "italic":
                            if (selectedText == "") {
                                selectedText = " ";
                                additionalCharacters = 1;
                                blankSpaceSelection = true;
                            } else
                                additionalCharacters = 2;
                                ;
                            modifiedText = "*" + selectedText + "*";       
                            break;

                        case "heading1":
                            modifiedText = "# " + selectedText;
                            additionalCharacters = 2;
                            break;

                        case "heading2":
                            modifiedText = "## " + selectedText;
                            additionalCharacters = 3;
                            break;

                        case "heading3":
                            modifiedText = "### " + selectedText;
                            additionalCharacters = 4;
                            break;

                        case "listBullets":
                            var lines = selectedText.split("\n");
                            for (var i = 0; i < lines.length; i++) {
                                modifiedText += "* " + lines[i];
                                if (i != lines.length - 1)
                                    modifiedText += "\n"
                                additionalCharacters += 2;
                            }
                            break;

                        case "listNumbers":
                            var lines = selectedText.split("\n");
                            for (var i = 0; i < lines.length; i++) {
                                modifiedText += (i + 1).toString() + ". " + lines[i];
                                if (i != lines.length - 1)
                                    modifiedText += "\n"
                                if (i < 9)
                                    additionalCharacters += 3;
                                else
                                    additionalCharacters += 4;
                            }
                            break;
                    }

                    updateSelection(modifiedText, selectionRange, selectedTextStart, selectedTextEnd, additionalCharacters, blankSpaceSelection);
                }            
                
                textField.focus();

            };

            var updateSelection = function(modifiedText, selectionRange, selectedTextStart, selectedTextEnd, additionalCharacters, blankSpaceSelection) { 
                if (selectionRange) {
                    $timeout(function() {
                        selectionRange.text = modifiedText;
                        selectionRange.collapse(true);
                        if (blankSpaceSelection)
                            selectionRange.moveEnd('character', selectedTextEnd + additionalCharacters + 1);
                        else
                            selectionRange.moveEnd('character', selectedTextEnd + additionalCharacters);
                        selectionRange.moveStart('character', selectedTextEnd + additionalCharacters);
                        selectionRange.select();
                    });
                } else {
                    scope.markdownText = scope.markdownText.substring(0, selectedTextStart) + modifiedText + scope.markdownText.substring(selectedTextEnd);
                    $timeout(function() {
                        if (blankSpaceSelection)
                            textField.setSelectionRange(selectedTextEnd + additionalCharacters, selectedTextEnd + additionalCharacters + 1);
                        else
                            textField.setSelectionRange(selectedTextEnd + additionalCharacters, selectedTextEnd + additionalCharacters);
                    });
                }
            };

        }
    }
}]);