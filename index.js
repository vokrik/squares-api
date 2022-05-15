const puppeteer = require('puppeteer');
const express = require('express');
var cors = require('cors')
process.on('unhandledRejection', error => {
  process.exit(1)
});

const app = express()
app.use(cors())
const port = 8080

const players = [
      {
        id: 81386432,
          name: "Martin",
          handicap: 22,
      },
      {
          id: 7065211,
          name: "Ondra",
          handicap: 0,
      }
      ,
      {
          id: 22199054,
          name: "Adam",
          handicap: 18,
      },
      {
        id: 25000090,
        name: "Teri",
        handicap: 20,
    }
  ]

async function fetchData() {
const browser = await puppeteer.launch({  ...(process.env.IS_DOCKER && {executablePath: '/usr/bin/chromium-browser'}), args: [ '--disable-gpu', '--disable-setuid-sandbox', '--no-sandbox', '--no-zygote' ] });

  async function fetchForPlayer(id) {
    const page = await browser.newPage();
    await page.goto(`https://veloviewer.com/athlete/${id}`);
    console.log('parsing...')
    await page.waitForSelector('#explorerDD', { timeout: 5000 });

    const div = await page.evaluate(() => {
      return document.querySelector('#explorerDD').innerHTML;
    });

    const pattern = /\d+x\d+/
    
    const [matchStr] = div.match(pattern)
    return parseInt(matchStr.split('x')[0])
  }

  try {

    const results =  await Promise.all(players.map(async (player) => {
      const score = await fetchForPlayer(player.id)
      const total = score + player.handicap
      return {...player, score, total }
    }  ))
    await browser.close();
    return results
  } catch (error) {
    console.log(error);
  }
}

app.get('/', async (req, res) => {
  res.json(await fetchData())
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
