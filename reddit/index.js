const reddit = require('./reddit');
const fs = require('fs');

(async () => {
    await reddit.initialize('investing');

    let results = await reddit.getResults(30);
    fs.writeFileSync('Output.txt', JSON.stringify(results, null, 2), (err) => {
      if (err) throw err;
    })

    process.exit();

})();
