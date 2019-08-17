const puppeteer = require('puppeteer');

const REDDIT_URL = (reddit) => `https://old.reddit.com/r/${reddit}/`;

const self = {
    browser: null,
    pages: null,

    initialize: async (reddit) => {
        self.browser = await puppeteer.launch({
            headless: false
        });
        self.page = await self.browser.newPage();

        /* go to subreddit */
        await self.page.goto(REDDIT_URL(reddit), {waitUntil: 'networkidle0'});

    },

    getResults: async (number) => {
        let results = [];

        do {
            let result = await self.parseResults();

            results = [...results, ...result];

            if (results.length <  number) {
                let nextPageButton = await self.page.$('span[class="next-button"] > a[rel="nofollow next"]');

                if (nextPageButton) {
                    await nextPageButton.click();
                    await self.page.waitForNavigation({waitUntil: 'networkidle0'});
                } else {
                    break;
                }
            }

        } while (results.length <= number);
        self.page.close();

        return results.slice(0, number);
    },

    parseResults: async () => {
      let elements = await self.page.$$('#siteTable > div[class*="thing"]');
      let results = []

      for(let element of elements) {

          let test = await element.$eval(('p[class="tagline "]'), node => node.innerText.slice(0,8));
          if (test === 'promoted') {
              continue;
          }

          let title = await element.$eval(('p[class="title"]'), node  => node.innerText.trim());
          let rank = await element.$eval(('span[class="rank"]'), node => node.innerText.trim());
          let post = await element.$eval(('p[class="tagline "] > time'), node => node.getAttribute('title'));
          let authorName = await element.$eval(('p[class="tagline "] > a[class*="author"]'), node => node.innerText.trim());
          let score = await element.$eval(('div[class="score likes"]'), node => node.innerText.trim());
          let comments = await element.$eval(('a[data-event-action="comments"]'), node => node.innerText.trim());
          results.push({
              title,
              rank,
              time_posted: post,
              authorName,
              score,
              comments
         })

      }

      return results;
    }



}

module.exports = self;
