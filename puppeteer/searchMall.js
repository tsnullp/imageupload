const startBrowser = require("./startBrowser")
const smartStoreCategory = require("../models/category")
const { sleep } = require("../lib/userFunc")
const NaverMall = require("../models/naverMall")
const moment = require("moment")

const start = async () => {
  try {
    console.log("start")
    for (const item of smartStoreCategory) {
      await categorySourcing({ categoryID: item.카테고리코드 })
      await sleep(10000)
    }
  } catch (e) {
    console.log("searchMall", e.message)
  }
}

const categorySourcing = async ({ categoryID }) => {
  const browser = await startBrowser()
  try {
    await search({ browser, categoryID })
  } catch (e) {
  } finally {
    await browser.close()
  }
}

const search = async ({ browser, categoryID }) => {
  try {
    const pageArr1 = []
    const pageArr2 = []
    const pageArr3 = []
    const pageArr4 = []
    for (let i = 1; i < 6; i++) {
      pageArr1.push(i)
    }
    for (let i = 6; i < 11; i++) {
      pageArr2.push(i)
    }
    for (let i = 11; i < 16; i++) {
      pageArr3.push(i)
    }
    for (let i = 16; i < 21; i++) {
      pageArr4.push(i)
    }

    const arrayPromises1 = pageArr1.map(async item => {
      let page = await browser.newPage()
      await searchCategory({
        page,
        categoryID,
        index: item
      })
    })

    const arrayPromises2 = pageArr2.map(async item => {
      let page = await browser.newPage()
      await searchCategory({
        page,
        categoryID,
        index: item
      })
    })

    const arrayPromises3 = pageArr3.map(async item => {
      let page = await browser.newPage()
      await searchCategory({
        page,
        categoryID,
        index: item
      })
    })

    const arrayPromises4 = pageArr4.map(async item => {
      let page = await browser.newPage()
      await searchCategory({
        page,
        categoryID,
        index: item
      })
    })
    await sleep(2000)
    await Promise.all(arrayPromises1)
    await sleep(2000)
    await Promise.all(arrayPromises2)
    await sleep(2000)
    await Promise.all(arrayPromises3)
    await sleep(2000)
    await Promise.all(arrayPromises4)
    await sleep(2000)
  } catch (e) {}
}

const searchCategory = async ({ page, categoryID, index = 1 }) => {
  try {
    await page.setDefaultNavigationTimeout(0)

    const URL = `https://search.shopping.naver.com/search/category?catId=${categoryID}&frm=NVSHOVS&pagingIndex=${index}&pagingSize=80&productSet=overseas&query&sort=rel&timestamp=&viewType=list`
    // await page.goto(URL, { waitUntil: 'domcontentloaded' })
    await page.goto(URL, { waitUntil: "networkidle0" })

    const data = await page.evaluate(() =>
      Array.from(document.querySelectorAll("script"))
        .filter(elem => elem.type === "application/json")
        .map(elem => elem.textContent)
    )

    const filterData = data.filter(item => item !== null)

    if (filterData.length !== 1) {
      return
    }

    const response = filterData[0]

    const resObj = JSON.parse(response)
    const { list } = resObj.props.pageProps.initialState.products
    // console.log('json = ', list)

    // let dummyData = list.filter(({ item }) => item.openDate >= agoMonth).map(({ item }) => {
    let temp = list
      .filter(({ item }) => item.mallPcUrl && item.mallPcUrl.includes("smartstore"))
      .map(({ item }) => item)
    temp.reduce((unique, item) => (unique.includes(item.mallNo) ? unique : [...unique, item]), [])

    for (const item of temp) {
      await NaverMall.findOneAndUpdate(
        {
          mallNo: item.mallNo
        },
        {
          $set: {
            mallNo: item.mallNo,
            mallName: item.mallName,
            mallPcUrl: item.mallPcUrl,
            lastUpdate: moment().toDate()
          }
        },
        { upsert: true }
      )
    }

    await page.goto("about:blank")
    await page.close()
  } catch (e) {
    console.log("searchCategory ->", e)
  }

  //I will leave this as an excercise for you to
  //  write out to FS...
}

module.exports = start
