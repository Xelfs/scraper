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

    getResults: async (number, search_term) => {
        let results = [];
        let count = 0;
        do {
            let result = await self.parseResults(search_term);
            if (result.length === 0) {
              count++;
            } else {
              count = 0;
            }
            results = [...results, ...result];

            if (results.length <  number) {
                let nextPageButton = await self.page.$('span[class="next-button"] > a[rel="nofollow next"]');

                if (nextPageButton && count < 2) {
                    await nextPageButton.click();
                    await self.page.waitForNavigation({waitUntil: 'networkidle0'});
                } else {
                    break;
                }
            }

        } while (results.length <= number);

        self.browser.close();
        return results.slice(0, number);
    },

    parseResults: async (search_term) => {
      let elements = await self.page.$$('#siteTable > div[class*="thing"]');
      let results = []

      for(let element of elements) {

          let promo = await element.$eval(('p[class="tagline "]'), node => node.innerText.slice(0,8));
          if (promo === 'promoted') {
              continue;
          }

          let title = await element.$eval(('p[class="title"] > a[class*="title"]'), node  => node.innerText.trim());

          if (search_term.length !== 0 && !title.includes(search_term)) {
              continue;
          }

          let rank = await element.$eval(('span[class="rank"]'), node => node.innerText.trim());
          let post = await element.$eval(('p[class="tagline "] > time'), node => node.getAttribute('title'));
          let authorName = await element.$eval(('p[class="tagline "] > a[class*="author"]'), node => node.innerText.trim());
          let score = await element.$eval(('div[class="score likes"]'), node => node.innerText.trim());
          let comments = await element.$eval(('a[data-event-action="comments"]'), node => node.innerText.trim());
          let link = await element.$eval(('p[class="title"] > a[class*="title"]'), node  => node.getAttribute('href'));
          let full_link = 'www.reddit.com'.concat(link);
          results.push({
              title,
              rank,
              time_posted: post,
              authorName,
              score,
              comments,
              link: full_link
         })

      }

      return results;
    }

}

module.exports = self;
