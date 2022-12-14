const express = require('express');
const https = require('https')
const http = require('http')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const morgan = require('morgan')
const _ = require('lodash')
const fs = require('fs')
const app = express();
const moment = require("moment")
const path = require("path")
const fetch = require('node-fetch')
const gify = require("node-video-to-gif")
const database = require("./database")
const AccessToken = require("./models/AccessToken")
const Cookie = require("./models/Cookie")
const NaverMall = require("./models/naverMall")
const NaverFavoriteItem = require("./models/NaverFavoriteItem")
const NaverJapanItem = require("./models/NaverJapanItem")
const User = require("./models/User")
const Basic = require("./models/Basic")
const Market = require("./models/Market")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const nodeBase64 = require("nodejs-base64-converter")
const request = require("request-promise-native")
const {
  sleep,
  checkStr,
  regExp_test,
  imageCheck,
  AmazonAsin,
  getAppDataPath,
  DimensionArray
} = require("./lib/userFunc")
const getNaverRecommendShopping = require("./puppeteer/getNaverRecommendShopping")
const axios = require("axios")

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0


const CLIENT_ID1 = "lv8Si6qgAV6iLJqrCCYp4B"
const CLIENT_ID2 = "7bFAHrRCBlplAcsGJEZmmD"
const CLIENT_ID3 = "seY7sh5SWCqDtzGmLZboyH"
const SECRET_KEY1 = "M8UFmAzlK50jVYCMXqrTjD"
const SECRET_KEY2 = "pOMhnUDuGFxgEekaw10IgE"
const SECRET_KEY3 = "NOq7vE2iIx2ouflwWEV2ID"
const REDIRECT_URL1 = "https://tsnullp.chickenkiller.com/cafe24/token/callbak1"
const REDIRECT_URL2 = "https://tsnullp.chickenkiller.com/cafe24/token/callbak2"
const REDIRECT_URL3 = "https://tsnullp.chickenkiller.com/cafe24/token/callbak3"
let mallid

const startServer = async () => {
  // const options = await createCA()
  // console.log("options", options)
  let options = {}
  try{
    options = {
      key: fs.readFileSync(__dirname + '\\ssl\\private.key', 'utf-8'),
      cert: fs.readFileSync(__dirname + '\\ssl\\certificate.crt', 'utf-8'),
      requestCert: false,
      rejectUnauthorized: false
    }
  } catch(e){}

  // ?????? ????????? ??????
  app.use(fileUpload({
      createParentPath: true
  }));

  // ?????? ?????? ??????
  app.use(cors({
    origin: true,  
    credentials: true, // ????????? ????????? ??????
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
  }));

  app.use(bodyParser.json());
  app.use(bodyParser.json({limit: "50000mb"}))
  app.use(bodyParser.urlencoded({
    limit: "50000mb",
    extended:true
  }));

  app.use(morgan('dev'));

  // ?????? ??????
  const httpsPort = 5100;
  const httpPort = 5101;

  // const httpsPort = 5200;
  // const httpPort = 5201;
  const DIR = path.join("D:", "imageupload")
  const UPLOAD = "upload"

  app.use(express.static(path.join(DIR,UPLOAD)));

  // app.listen(5102, () => {
  //   console.log(`HTTP server listening on port ${5102}.`);
  // })

  http.createServer(app).listen(httpPort, () =>{
    console.log(`HTTP server listening on port ${httpPort}.`);
  })


  app.post('/upload', async (req, res) => {
    try {
        if (!req.body.base64str) {
            res.send({
                status: false,
                message: '?????? ????????? ??????'
            });
        } else {
          const TODAY = moment().format("YYYYMMDD")
          const UPLOAD_FOLDER = path.join(DIR, UPLOAD)
          const UPLOAD_FOLDER_TODAY = path.join(UPLOAD_FOLDER, TODAY)
  
          !fs.existsSync(UPLOAD) && fs.mkdirSync(UPLOAD)
          !fs.existsSync(UPLOAD_FOLDER) && fs.mkdirSync(UPLOAD_FOLDER)
          !fs.existsSync(UPLOAD_FOLDER_TODAY) && fs.mkdirSync(UPLOAD_FOLDER_TODAY)
          
            let randomStr = Math.random().toString(36).substring(2, 12);
            let fileName = path.join(TODAY, `${randomStr}.jpg`)
            while(fs.existsSync(path.join(UPLOAD_FOLDER, fileName))){
              randomStr = Math.random().toString(36).substring(2, 12);
              fileName = path.join(TODAY, `${randomStr}.jpg`)
            }
            const FILE_DIR = path.join(UPLOAD_FOLDER, fileName)
            let base64String = req.body.base64str
            if(base64String.includes("base64,")){
              base64String = base64String.split("base64,")[1]
            }
            const bitmap = new Buffer(base64String, 'base64');  
            fs.writeFileSync(FILE_DIR, bitmap)
            res.send({
                status: true,
                message: '????????? ????????? ???????????????.',
                data: `https://tsnullp.chickenkiller.com/${TODAY}/${randomStr}.jpg`
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
  })

  app.post('/upload-multi', async(req, res) => {
    try {
        if (!req.body.base64strs) {
            res.send({
                status: false,
                message: "?????? ????????? ??????"
            })
        } else {
          let data = [];
          const TODAY = moment().format("YYYYMMDD")
          const UPLOAD_FOLDER = path.join(DIR, UPLOAD)
          const UPLOAD_FOLDER_TODAY = path.join(UPLOAD_FOLDER, TODAY)
  
          !fs.existsSync(UPLOAD) && fs.mkdirSync(UPLOAD)
          !fs.existsSync(UPLOAD_FOLDER) && fs.mkdirSync(UPLOAD_FOLDER)
          !fs.existsSync(UPLOAD_FOLDER_TODAY) && fs.mkdirSync(UPLOAD_FOLDER_TODAY)
            
            const base64arr = req.body.base64strs.split("PAPAGO_OCR")
            if(Array.isArray(base64arr)){
              for(const item of base64arr) {
                if(item.length > 10){
                  try {
                    let randomStr = Math.random().toString(36).substring(2, 12);
                    let fileName = path.join(TODAY, `${randomStr}.jpg`)
                    while(fs.existsSync(path.join(UPLOAD, fileName))){
            
                      randomStr = Math.random().toString(36).substring(2, 12);
                      fileName = path.join(TODAY, `${randomStr}.jpg`)
                    }
                    const FILE_DIR = path.join(UPLOAD_FOLDER, fileName)
                    let base64String = item
                    if(base64String.includes("base64,")){
                      base64String = base64String.split("base64,")[1]
                    }
          
                    const bitmap = new Buffer(base64String, 'base64');  
                    fs.writeFileSync(FILE_DIR, bitmap)
                    data.push(`https://tsnullp.chickenkiller.com/${TODAY}/${randomStr}.jpg`)
                  } catch(e){
                    console.log("??????--->", e)
                  }
                }
                
              }
    
              // return response
              res.send({
                  status: true,
                  message: '???????????? ????????? ???????????????.',
                  data: data
              });
            } else {
              res.send({
                status: false,
                message: "?????? ????????? ??????"
              })
            }
          
        }
    } catch (err) {
        console.log("err00", err)
        res.status(500).send(err);
    }
  })

  app.post('/upload-mp4', async (req, res) => {
    try {
        if (!req.body.mp4Url) {
            res.send({
                status: false,
                message: '?????? ????????? ??????'
            });
        } else {
            const TODAY = moment().format("YYYYMMDD")
            const UPLOAD_FOLDER = path.join(DIR, UPLOAD)
            const UPLOAD_FOLDER_TODAY = path.join(UPLOAD_FOLDER, TODAY)
    
            !fs.existsSync(UPLOAD) && fs.mkdirSync(UPLOAD)
            !fs.existsSync(UPLOAD_FOLDER) && fs.mkdirSync(UPLOAD_FOLDER)
            !fs.existsSync(UPLOAD_FOLDER_TODAY) && fs.mkdirSync(UPLOAD_FOLDER_TODAY)

            let randomStr = Math.random().toString(36).substring(2, 12);
            let fileName = path.join(TODAY, `${randomStr}.mp4`)
            while(fs.existsSync(path.join(UPLOAD_FOLDER, fileName))){
              randomStr = Math.random().toString(36).substring(2, 12);
              fileName = path.join(TODAY, `${randomStr}.mp4`)
            }
            const FILE_DIR = path.join(UPLOAD_FOLDER, fileName)
            const response = await fetch(req.body.mp4Url)
     
            const buffer = await response.buffer();
          
            fs.writeFileSync(FILE_DIR, buffer)
    
            gifyPromise(FILE_DIR, path.join(UPLOAD_FOLDER_TODAY, `${randomStr}.gif`))
          
            
            res.send({
                status: true,
                message: '????????? ????????? ???????????????.',
                data: `https://tsnullp.chickenkiller.com/${TODAY}/${randomStr}.gif`
            });
        }
    } catch (err) {
      console.log("err--->", err)
        res.status(500).send(err);
    }
  })


  //https ??????????????? certificate??? private key??? ????????? ????????? ??????
  https.createServer(options, app).listen(httpsPort, () => {
    console.log(`HTTPS server started on port ${httpsPort}`);
  });


  app.get("/cafe24/token1", (req, res) => {
    mallid = req.query.mallid
    const scope =
      "mall.read_category,mall.write_category,mall.write_collection,mall.read_order,mall.write_order,mall.read_product,mall.write_product,mall.read_salesreport,mall.read_shipping,mall.write_shipping,mall.read_community"
    // const scope = "mall.read_order"
    const url = `https://${mallid}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${CLIENT_ID1}&redirect_uri=${REDIRECT_URL1}&scope=${scope}`
  
    res.redirect(url)
  })
  app.get("/cafe24/token2", (req, res) => {
    mallid = req.query.mallid
    const scope =
      "mall.read_category,mall.write_category,mall.write_collection,mall.read_order,mall.write_order,mall.read_product,mall.write_product,mall.read_salesreport,mall.read_shipping,mall.write_shipping,mall.read_community"
    // const scope = "mall.read_order"
    const url = `https://${mallid}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${CLIENT_ID2}&redirect_uri=${REDIRECT_URL2}&scope=${scope}`
  
    res.redirect(url)
  })
  app.get("/cafe24/token3", (req, res) => {
    mallid = req.query.mallid
    const scope =
      "mall.read_category,mall.write_category,mall.write_collection,mall.read_order,mall.write_order,mall.read_product,mall.write_product,mall.read_salesreport,mall.read_shipping,mall.write_shipping,mall.read_community"
    // const scope = "mall.read_order"
    const url = `https://${mallid}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${CLIENT_ID3}&redirect_uri=${REDIRECT_URL3}&scope=${scope}`
  
    res.redirect(url)
  })
  
  app.get("/cafe24/token/callbak1", async (req, res) => {
    
    try {
      const code = req.query.code
      const response = await getAccessToken1(code)
      if (response) {
        // const { access_token, refresh_token } = res.json({ access_token, refresh_token, scopes })
        res.json(response)
      } else {
        res.json({ access_token: "", refresh_token: "", scopes: [] })
      }
    } catch(e) {
      res.json({ access_token: "", refresh_token: e, scopes: [] })
    }
    
  })
  app.get("/cafe24/token/callbak2", async (req, res) => {
    const code = req.query.code
    const response = await getAccessToken2(code)
  
    if (response) {
      // const { access_token, refresh_token } = res.json({ access_token, refresh_token, scopes })
      res.json(response)
    } else {
      res.json({ access_token: "", refresh_token: "", scopes: [] })
    }
  })
  app.get("/cafe24/token/callbak3", async (req, res) => {
    const code = req.query.code
    const response = await getAccessToken3(code)
  
    if (response) {
      // const { access_token, refresh_token } = res.json({ access_token, refresh_token, scopes })
      res.json(response)
    } else {
      res.json({ access_token: "", refresh_token: "", scopes: [] })
    }
  })
  
  app.post("/taobao/cookie", async (req, res) => {
    try {
      const { nick, cookie } = req.body
      await Cookie.findOneAndUpdate(
        {
          name: nick,
        },
        {
          $set: {
            name: nick,
            cookie,
            lastUpdate: moment().toDate(),
          },
        },
        {
          upsert: true,
        }
      )
    } catch (e) {
      console.log("/taobao/cookie", e)
    } finally {
      res.json({ succuess: "ok" })
    }
  })

}

startServer()
database()

const gifyPromise = (a, b) => {
  return new Promise((resolve, reject) => {
    gify(a, b, {
      // width: 100,
      // rate: 4,
      // start: 4,
      // duration: 6
    }, function(err){
    //  fs.unlink(path.join(UPLOAD, fileName))
      fs.unlinkSync(a)
      if (err) {
        console.log("err0", err)
        reject(err)
      } else {
        resolve(b)
      }
    });
  })
}

const getAccessToken1 = async (code) => {
  try {
    const auth = nodeBase64.encode(`${CLIENT_ID1}:${SECRET_KEY1}`)
    let payload = `grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URL1}`
    let options = {
      method: "POST",
      url: `https://${mallid}.cafe24api.com/api/v2/oauth/token`,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
      json: true,
    }

    let response = await request(options)

    await AccessToken.findOneAndUpdate(
      { mall_id: mallid },
      {
        $set: {
          tokenType: 1,
          access_token: response.access_token,
          expires_at: response.expires_at,
          refresh_token: response.refresh_token,
          refresh_token_expires_at: response.refresh_token_expires_at,
          client_id: response.client_id,
          user_id: response.user_id,
          issued_at: response.issued_at,
        },
      },
      { upsert: true }
    )
    return response
  } catch (e) {
    console.log("getAccessToken", e)
    return null
  }
}

const getAccessToken2 = async (code) => {
  try {
    const auth = nodeBase64.encode(`${CLIENT_ID2}:${SECRET_KEY2}`)
    let payload = `grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URL2}`
    let options = {
      method: "POST",
      url: `https://${mallid}.cafe24api.com/api/v2/oauth/token`,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
      json: true,
    }

    let response = await request(options)

    await AccessToken.findOneAndUpdate(
      { mall_id: mallid },
      {
        $set: {
          tokenType: 2,
          access_token: response.access_token,
          expires_at: response.expires_at,
          refresh_token: response.refresh_token,
          refresh_token_expires_at: response.refresh_token_expires_at,
          client_id: response.client_id,
          user_id: response.user_id,
          issued_at: response.issued_at,
        },
      },
      { upsert: true }
    )
    return response
  } catch (e) {
    console.log("getAccessToken2", e)
    return null
  }
}
const getAccessToken3 = async (code) => {
  try {
    const auth = nodeBase64.encode(`${CLIENT_ID3}:${SECRET_KEY3}`)
    let payload = `grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URL3}`
    let options = {
      method: "POST",
      url: `https://${mallid}.cafe24api.com/api/v2/oauth/token`,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
      json: true,
    }

    let response = await request(options)

    await AccessToken.findOneAndUpdate(
      { mall_id: mallid },
      {
        $set: {
          tokenType: 3,
          access_token: response.access_token,
          expires_at: response.expires_at,
          refresh_token: response.refresh_token,
          refresh_token_expires_at: response.refresh_token_expires_at,
          client_id: response.client_id,
          user_id: response.user_id,
          issued_at: response.issued_at,
        },
      },
      { upsert: true }
    )
    return response
  } catch (e) {
    console.log("getAccessToken3", e)
    return null
  }
}

const getAccessTokenWithRefreshToken1 = async () => {
  try {
    const tokenList = await AccessToken.find({ tokenType: 1 })
    for (const item of tokenList) {
      try {
        const auth = nodeBase64.encode(`${CLIENT_ID1}:${SECRET_KEY1}`)
        let payload = `grant_type=refresh_token&refresh_token=${item.refresh_token}`
        let options = {
          method: "POST",
          url: `https://${item.mall_id}.cafe24api.com/api/v2/oauth/token`,
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: payload,
          json: true,
        }

        let response = await request(options)

        await AccessToken.findOneAndUpdate(
          { mall_id: item.mall_id },
          {
            $set: {
              tokenType: 1,
              access_token: response.access_token,
              expires_at: response.expires_at,
              refresh_token: response.refresh_token,
              refresh_token_expires_at: response.refresh_token_expires_at,
              client_id: response.client_id,
              user_id: response.user_id,
              issued_at: response.issued_at,
            },
          },
          { upsert: true }
        )
      } catch (e) {
        console.log("getAccessTokenWithRefreshToken1", e)
      }
    }
  } catch (e) {
    console.log("getAccessTokenWithRefreshToken", e)
  }
}
const getAccessTokenWithRefreshToken2 = async () => {
  try {
    const tokenList = await AccessToken.find({ tokenType: 2 })
    for (const item of tokenList) {
      try {
        const auth = nodeBase64.encode(`${CLIENT_ID2}:${SECRET_KEY2}`)
        let payload = `grant_type=refresh_token&refresh_token=${item.refresh_token}`
        let options = {
          method: "POST",
          url: `https://${item.mall_id}.cafe24api.com/api/v2/oauth/token`,
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: payload,
          json: true,
        }
        
        let response = await request(options)

        await AccessToken.findOneAndUpdate(
          { mall_id: item.mall_id },
          {
            $set: {
              tokenType: 2,
              access_token: response.access_token,
              expires_at: response.expires_at,
              refresh_token: response.refresh_token,
              refresh_token_expires_at: response.refresh_token_expires_at,
              client_id: response.client_id,
              user_id: response.user_id,
              issued_at: response.issued_at,
            },
          },
          { upsert: true }
        )
      } catch (e) {
        console.log("getAccessTokenWithRefreshToken2", e)
      }
    }
  } catch (e) {
    console.log("getAccessTokenWithRefreshToken", e)
  }
}
const getAccessTokenWithRefreshToken3 = async () => {
  try {
    const tokenList = await AccessToken.find({ tokenType: 3 })
    for (const item of tokenList) {
      try {
        const auth = nodeBase64.encode(`${CLIENT_ID3}:${SECRET_KEY3}`)
        let payload = `grant_type=refresh_token&refresh_token=${item.refresh_token}`
        let options = {
          method: "POST",
          url: `https://${item.mall_id}.cafe24api.com/api/v2/oauth/token`,
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: payload,
          json: true,
        }

        let response = await request(options)

        await AccessToken.findOneAndUpdate(
          { mall_id: item.mall_id },
          {
            $set: {
              tokenType: 3,
              access_token: response.access_token,
              expires_at: response.expires_at,
              refresh_token: response.refresh_token,
              refresh_token_expires_at: response.refresh_token_expires_at,
              client_id: response.client_id,
              user_id: response.user_id,
              issued_at: response.issued_at,
            },
          },
          { upsert: true }
        )
      } catch (e) {
        console.log("getAccessTokenWithRefreshToken2", e)
      }
    }
  } catch (e) {
    console.log("getAccessTokenWithRefreshToken", e)
  }
}



const searchNaverItem = async () => {
  while(true) {
    try {
      const naverMalls = await NaverMall.aggregate([
        {
          $match: {
            // seachLabel: 1,
            // productCount: { $gt: 0 },
          },
        }
      ])
      let i = 0
  
      for(const items of DimensionArray(naverMalls, 20)) {
        await sleep(2000)
      
        const promiseArray = items.map((item, index) => {
          return new Promise(async (resolve, reject) => {
            try {
              // console.log("mallName", `${i * index * 20 + index} / ${naverMalls.length}`, item.mallName)
              const response = await getNaverRecommendShopping({
                url: item.mallPcUrl,
                category: "",
                regDay: 300,
                minRecent: 0,
                maxRecent: 50,
                totalMinSale: 1,
                totalMaxSale: 100,
                minReview: 0,
                maxReview: 1000,
                minPrice: 0,
                maxPrice: 2000000,
              })
        
              if (Array.isArray(response) && response.length > 0) {
                for (const naverItem of response) {
                  // console.log("naverItem", naverItem.name)
                  // console.log("naverItem.originArea", naverItem.originArea)
        
                  try {
                    if (naverItem.originArea === "??????") {
                      await NaverJapanItem.findOneAndUpdate(
                        {
                          // userID: ObjectId("5f0d5ff36fc75ec20d54c40b"),
                          productNo: naverItem.productNo,
                        },
                        {
                          $set: {
                            // userID: ObjectId("5f0d5ff36fc75ec20d54c40b"),
                            productNo: naverItem.productNo,
                            displayName: naverItem.displayName,
                            detailUrl: naverItem.detailUrl,
                            name: naverItem.name,
                            title: naverItem.name.replace(/ /gi, ""),
                            categoryId: naverItem.categoryId,
                            category1: naverItem.category1,
                            category2: naverItem.category2,
                            category3: naverItem.category3,
                            category4: naverItem.category4,
                            salePrice: Number(naverItem.salePrice) ? Number(naverItem.salePrice) : 0,
                            regDate: naverItem.regDate,
                            image: naverItem.image,
                            sellerTags: naverItem.sellerTags,
                            reviewCount: naverItem.reviewCount,
                            zzim: naverItem.zzim,
                            purchaseCnt: naverItem.purchaseCnt,
                            recentSaleCount: naverItem.recentSaleCount,
                            zzim: naverItem.zzim,
                            createdAt: moment().toDate(),
                          },
                        },
                        {
                          upsert: true,
                          new: true,
                        }
                      )
                    } else {
                      await NaverFavoriteItem.findOneAndUpdate(
                        {
                          // userID: ObjectId("5f0d5ff36fc75ec20d54c40b"),
                          productNo: naverItem.productNo,
                        },
                        {
                          $set: {
                            // userID: ObjectId("5f0d5ff36fc75ec20d54c40b"),
                            productNo: naverItem.productNo,
                            displayName: naverItem.displayName,
                            detailUrl: naverItem.detailUrl,
                            name: naverItem.name,
                            title: naverItem.name.replace(/ /gi, ""),
                            categoryId: naverItem.categoryId,
                            category1: naverItem.category1,
                            category2: naverItem.category2,
                            category3: naverItem.category3,
                            category4: naverItem.category4,
                            salePrice: Number(naverItem.salePrice) ? Number(naverItem.salePrice) : 0,
                            regDate: naverItem.regDate,
                            image: naverItem.image,
                            sellerTags: naverItem.sellerTags,
                            reviewCount: naverItem.reviewCount,
                            zzim: naverItem.zzim,
                            purchaseCnt: naverItem.purchaseCnt,
                            recentSaleCount: naverItem.recentSaleCount,
                            zzim: naverItem.zzim,
                            createdAt: moment().toDate(),
                            originArea: naverItem.originArea
                          },
                        },
                        {
                          upsert: true,
                          new: true,
                        }
                      )
                    }
                    
                  } catch (e) {
                    console.log("error", e)
                  }
                }
                // naverItemList.push(...response)
              }
  
              resolve()
            } catch (e) {
              console.log("Promise Error", e)
              reject(e)
            }
          })
        })
        await Promise.all(promiseArray)
      }
      console.log("***** ??? *****")
    } catch (e) {
      console.log("scheduleError", e)
    }
    
  }

}

setTimeout(() => {
  getAccessTokenWithRefreshToken1()
  getAccessTokenWithRefreshToken2()
  getAccessTokenWithRefreshToken3()
  searchNaverItem()
}, 10000)

setInterval(async function () {
  
  await getAccessTokenWithRefreshToken1()
  await getAccessTokenWithRefreshToken2()
  await getAccessTokenWithRefreshToken3()

}, 20 * 60 * 1000)