const reddit = require('./reddit');
const fs = require('fs');

var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp:true,
  description: 'Argparse for webscraper'
});

parser.addArgument(
  [ '-n', '--number' ],
  {
    help: 'number of results to be returned',
    defaultValue: 2
  }
);

parser.addArgument(
  [ '-s', '--search_term' ],
  {
    type: 'string',
    help: 'number of results to be returned from each subreddit',
    defaultValue: ''
  }
);

parser.addArgument(
  [ '-r', '--reddit' ],
  {
    type: 'string',
    action: 'append',
    help: 'subreddits to scrape default is investing',
    defaultValue: ['investing']
  }
);

var args = parser.parseArgs();

(async () => {
    var reddits = new Set(args['reddit']);
    let results = [];

    for(let subreddit of reddits) {
      await reddit.initialize(subreddit);
      let result = await reddit.getResults(args['number'], args['search_term']);
      results = [...results, ...result];
    }
    results.sort((a, b) => (parseInt(a.rank) > parseInt(b.rank)) ? 1 : -1);
    fs.writeFileSync('Output.txt', JSON.stringify(results, null, 2), (err) => {
      if (err) throw err;
    })

    process.exit();

})();
