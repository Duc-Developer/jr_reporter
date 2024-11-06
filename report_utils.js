const fs = require('fs');
const csv = require('csv-parser');

const getWorkLog = async () => {
    const results = [];
    const stream = fs.createReadStream('./report_data/work_log.csv').pipe(csv({
        separator: ',',
        quote: '"',
        skipLines: 0,
        headers: true
    }));

    for await (const data of stream) {
        results.push(data);
    }

    return results;
};

module.exports = { getWorkLog };