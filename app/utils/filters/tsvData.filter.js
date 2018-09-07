angular.module('arachne.filters')

    .filter('tsvData', function () {
        return function (data, columnNames) {
            var lines = data.split('\n');
            var headings = lines[0].split('\t');

            var parsedRows = [];
            var columnNameAndIndexPairs = [];

            for(var i = 0; i < columnNames.length; i++) {
                var index = headings.indexOf(columnNames[i]);

                if(index === -1) {
                    console.error('Missing column ' + columnNames[i] + ' in TSV data.');
                    continue;
                }

                columnNameAndIndexPairs.push({
                    'name': columnNames[i],
                    'index': index
                })
            }

            var line_index = 1;
            while (line_index < lines.length && lines[line_index].trim() !== '') {
                var parsedLine = {};
                var values = lines[line_index].split('\t');

                for(var i = 0; i < columnNameAndIndexPairs.length; i++) {
                    var currentPair = columnNameAndIndexPairs[i];
                    parsedLine[currentPair['name']] = values[currentPair['index']];
                }

                parsedRows.push(parsedLine);
                line_index += 1
            }

            return parsedRows
        }
    });