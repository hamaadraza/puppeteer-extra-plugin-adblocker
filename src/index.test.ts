import test from 'ava'
import puppeteer from 'puppeteer-extra'
import AdblockerPlugin from './index'

const PUPPETEER_ARGS = ['--no-sandbox', '--disable-setuid-sandbox']

test('will block ads', async t => {
  /** @eslint-disable-next-line */
  const adblockerPlugin = AdblockerPlugin({
    blockTrackers: true
  })
  puppeteer.use(adblockerPlugin)

  const browser = await puppeteer.launch({
    args: PUPPETEER_ARGS,
    headless: false,
  })

  const blocker = await adblockerPlugin.getBlocker()

  const page = await browser.newPage()

  let blockedRequests = 0
  blocker.on('request-blocked', () => {
    blockedRequests += 1
  })

  let hiddenAds = 0
  blocker.on('style-injected', () => {
    hiddenAds += 1
  })

  const url = 'https://www.google.com/search?q=rent%20a%20car'
  await page.goto(url, { waitUntil: 'networkidle0' })

  t.not(hiddenAds, 0)
  t.not(blockedRequests, 0)

  await browser.close()
})

// Skip the actual browser test but still test plugin initialization
test('can initialize adblocker plugin', async t => {
  const adblockerPlugin = AdblockerPlugin({
    blockTrackers: true
  })
  
  const blocker = await adblockerPlugin.getBlocker()
  
  t.truthy(blocker, 'Blocker should be initialized')
})
