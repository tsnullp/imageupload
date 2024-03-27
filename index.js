const express = require("express");
const https = require("https");
const http = require("http");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const morgan = require("morgan");
const _ = require("lodash");
const fs = require("fs");
const app = express();
const moment = require("moment");
const path = require("path");
const fetch = require("node-fetch");
const gify = require("node-video-to-gif");
const database = require("./database");
const AccessToken = require("./models/AccessToken");
const Brand = require("./models/Brand");
const Cookie = require("./models/Cookie");
const NaverMall = require("./models/naverMall");
const NaverFavoriteItem = require("./models/NaverFavoriteItem");
const NaverJapanItem = require("./models/NaverJapanItem");
const NaverJapanreviewItem = require("./models/NaverJapanreviewItem");
const BrandKeyword = require("./models/BrandKeyword");
const GetSeasonKeyword = require("./puppeteer/getSeasonKeyword");
const User = require("./models/User");
const Basic = require("./models/Basic");
const Market = require("./models/Market");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const nodeBase64 = require("nodejs-base64-converter");
const request = require("request-promise-native");
const {
  sleep,
  ranking,
  checkStr,
  regExp_test,
  imageCheck,
  AmazonAsin,
  getAppDataPath,
  DimensionArray,
  getToken,
  getSbth,
} = require("./lib/userFunc");
const getNaverRecommendShopping = require("./puppeteer/getNaverRecommendShopping");
const getNaverReviewShopping = require("./puppeteer/getNaverReviewShopping");
const axios = require("axios");
const tesseract = require("node-tesseract-ocr");
const { NaverKeywordRel } = require("./api/Naver");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const CLIENT_ID1 = "lv8Si6qgAV6iLJqrCCYp4B";
const CLIENT_ID2 = "7bFAHrRCBlplAcsGJEZmmD";
const CLIENT_ID3 = "seY7sh5SWCqDtzGmLZboyH";
const SECRET_KEY1 = "M8UFmAzlK50jVYCMXqrTjD";
const SECRET_KEY2 = "pOMhnUDuGFxgEekaw10IgE";
const SECRET_KEY3 = "NOq7vE2iIx2ouflwWEV2ID";
const REDIRECT_URL1 = "http://124.57.134.137:5101/cafe24/token/callbak1";
const REDIRECT_URL2 = "http://124.57.134.137:5101/cafe24/token/callbak2";
const REDIRECT_URL3 = "http://124.57.134.137:5101/cafe24/token/callbak3";
let mallid;

const startServer = async () => {
  // const options = await createCA()
  // console.log("options", options)
  let options = {};
  try {
    options = {
      key: fs.readFileSync(__dirname + "\\ssl\\private.key", "utf-8"),
      cert: fs.readFileSync(__dirname + "\\ssl\\certificate.crt", "utf-8"),
      requestCert: false,
      rejectUnauthorized: false,
    };
  } catch (e) {}

  // 파일 업로드 허용
  app.use(
    fileUpload({
      createParentPath: true,
    })
  );

  // 미들 웨어 추가
  app.use(
    cors({
      origin: true,
      credentials: true, // 크로스 도메인 허용
      methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    })
  );

  app.use(bodyParser.json());
  app.use(bodyParser.json({ limit: "500000mb" }));
  app.use(
    bodyParser.urlencoded({
      limit: "500000mb",
      extended: true,
    })
  );

  app.use(express.json({ limit: "500000mb" }));
  app.use(express.urlencoded({ limit: "500000mb", extended: true }));

  // app.use(bodyParser.raw({ type: "application/octet-stream" }));

  app.use(morgan("dev"));

  // 포트 설정
  const httpsPort = 5100;
  const httpPort = 5101;

  // const httpsPort = 5200;
  // const httpPort = 5201;
  const DIR = path.join("D:", "imageupload");
  const UPLOAD = "upload";

  app.use(express.static(path.join(DIR, UPLOAD)));

  // app.listen(5102, () => {
  //   console.log(`HTTP server listening on port ${5102}.`);
  // })

  http.createServer(app).listen(httpPort, () => {
    console.log(`HTTP server listening on port ${httpPort}.`);
  });

  app.post("/upload", async (req, res) => {
    try {
      if (!req.body.base64str) {
        res.send({
          status: false,
          message: "파일 업로드 실패",
        });
      } else {
        const TODAY = moment().format("YYYYMMDD");
        const UPLOAD_FOLDER = path.join(DIR, UPLOAD);
        const UPLOAD_FOLDER_TODAY = path.join(UPLOAD_FOLDER, TODAY);

        !fs.existsSync(UPLOAD) && fs.mkdirSync(UPLOAD);
        !fs.existsSync(UPLOAD_FOLDER) && fs.mkdirSync(UPLOAD_FOLDER);
        !fs.existsSync(UPLOAD_FOLDER_TODAY) &&
          fs.mkdirSync(UPLOAD_FOLDER_TODAY);

        let randomStr = Math.random().toString(36).substring(2, 12);
        let fileName = path.join(TODAY, `${randomStr}.jpg`);
        while (fs.existsSync(path.join(UPLOAD_FOLDER, fileName))) {
          randomStr = Math.random().toString(36).substring(2, 12);
          fileName = path.join(TODAY, `${randomStr}.jpg`);
        }
        const FILE_DIR = path.join(UPLOAD_FOLDER, fileName);
        let base64String = req.body.base64str;
        if (base64String.includes("base64,")) {
          base64String = base64String.split("base64,")[1];
        }
        const bitmap = new Buffer.from(base64String, "base64");
        fs.writeFileSync(FILE_DIR, bitmap);

        res.send({
          status: true,
          message: "파일이 업로드 되었습니다.",
          data: `https://tsnullp.chickenkiller.com/${TODAY}/${randomStr}.jpg`,
        });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  });
  app.post("/upload-chunk", async (req, res) => {
    try {
      const imageData = [];
      req.on("data", (chunk) => {
        imageData.push(chunk);
      });

      req.on("end", () => {
        const imageBuffer = Buffer.concat(imageData);
        const TODAY = moment().format("YYYYMMDD");
        const UPLOAD_FOLDER = path.join(DIR, UPLOAD);
        const UPLOAD_FOLDER_TODAY = path.join(UPLOAD_FOLDER, TODAY);

        !fs.existsSync(UPLOAD) && fs.mkdirSync(UPLOAD);
        !fs.existsSync(UPLOAD_FOLDER) && fs.mkdirSync(UPLOAD_FOLDER);
        !fs.existsSync(UPLOAD_FOLDER_TODAY) &&
          fs.mkdirSync(UPLOAD_FOLDER_TODAY);

        let randomStr = Math.random().toString(36).substring(2, 12);
        let fileName = path.join(TODAY, `${randomStr}.jpg`);
        while (fs.existsSync(path.join(UPLOAD_FOLDER, fileName))) {
          randomStr = Math.random().toString(36).substring(2, 12);
          fileName = path.join(TODAY, `${randomStr}.jpg`);
        }
        const FILE_DIR = path.join(UPLOAD_FOLDER, fileName);

        fs.writeFileSync(FILE_DIR, imageBuffer);

        res.send({
          status: true,
          message: "파일이 업로드 되었습니다.",
          data: `https://tsnullp.chickenkiller.com/${TODAY}/${randomStr}.jpg`,
        });
      });
    } catch (err) {
      res.status(500).send(err);
    }
  });
  app.post("/upload-multi", async (req, res) => {
    try {
      if (!req.body.base64strs) {
        res.send({
          status: false,
          message: "파일 업로드 실패",
        });
      } else {
        let data = [];
        const TODAY = moment().format("YYYYMMDD");
        const UPLOAD_FOLDER = path.join(DIR, UPLOAD);
        const UPLOAD_FOLDER_TODAY = path.join(UPLOAD_FOLDER, TODAY);

        !fs.existsSync(UPLOAD) && fs.mkdirSync(UPLOAD);
        !fs.existsSync(UPLOAD_FOLDER) && fs.mkdirSync(UPLOAD_FOLDER);
        !fs.existsSync(UPLOAD_FOLDER_TODAY) &&
          fs.mkdirSync(UPLOAD_FOLDER_TODAY);

        const base64arr = req.body.base64strs.split("PAPAGO_OCR");
        if (Array.isArray(base64arr)) {
          for (const item of base64arr) {
            if (item && item.length > 10) {
              try {
                let randomStr = Math.random().toString(36).substring(2, 12);
                let fileName = path.join(TODAY, `${randomStr}.jpg`);
                while (fs.existsSync(path.join(UPLOAD, fileName))) {
                  randomStr = Math.random().toString(36).substring(2, 12);
                  fileName = path.join(TODAY, `${randomStr}.jpg`);
                }
                const FILE_DIR = path.join(UPLOAD_FOLDER, fileName);
                let base64String = item;
                if (base64String.includes("base64,")) {
                  base64String = base64String.split("base64,")[1];
                }

                const bitmap = new Buffer.from(base64String, "base64");
                fs.writeFileSync(FILE_DIR, bitmap);
                data.push(
                  `https://tsnullp.chickenkiller.com/${TODAY}/${randomStr}.jpg`
                );
              } catch (e) {
                console.log("에러--->", e);
              }
            }
          }

          // return response
          res.send({
            status: true,
            message: "파일들이 업로드 되었습니다.",
            data: data,
          });
        } else {
          res.send({
            status: false,
            message: "파일 업로드 실패",
          });
        }
      }
    } catch (err) {
      console.log("err00", err);
      res.status(500).send(err);
    }
  });

  app.post("/upload-mp4", async (req, res) => {
    try {
      if (!req.body.mp4Url) {
        res.send({
          status: false,
          message: "파일 업로드 실패",
        });
      } else {
        const TODAY = moment().format("YYYYMMDD");
        const UPLOAD_FOLDER = path.join(DIR, UPLOAD);
        const UPLOAD_FOLDER_TODAY = path.join(UPLOAD_FOLDER, TODAY);

        !fs.existsSync(UPLOAD) && fs.mkdirSync(UPLOAD);
        !fs.existsSync(UPLOAD_FOLDER) && fs.mkdirSync(UPLOAD_FOLDER);
        !fs.existsSync(UPLOAD_FOLDER_TODAY) &&
          fs.mkdirSync(UPLOAD_FOLDER_TODAY);

        let randomStr = Math.random().toString(36).substring(2, 12);
        let fileName = path.join(TODAY, `${randomStr}.mp4`);
        while (fs.existsSync(path.join(UPLOAD_FOLDER, fileName))) {
          randomStr = Math.random().toString(36).substring(2, 12);
          fileName = path.join(TODAY, `${randomStr}.mp4`);
        }
        const FILE_DIR = path.join(UPLOAD_FOLDER, fileName);
        const response = await fetch(req.body.mp4Url);

        const buffer = await response.buffer();

        fs.writeFileSync(FILE_DIR, buffer);

        gifyPromise(
          FILE_DIR,
          path.join(UPLOAD_FOLDER_TODAY, `${randomStr}.gif`)
        );

        res.send({
          status: true,
          message: "파일이 업로드 되었습니다.",
          data: `https://tsnullp.chickenkiller.com/${TODAY}/${randomStr}.gif`,
        });
      }
    } catch (err) {
      console.log("err--->", err);
      res.status(500).send(err);
    }
  });

  app.post("/imageOcr", async (req, res) => {
    try {
      if (!req.body.image) {
        res.send({
          status: false,
          message: "이미지 없음",
        });
      } else {
        const image = req.body.image;
        if (!image.includes("http")) {
          res.send({
            status: false,
            message: "이미지 없음",
          });
        } else {
          try {
            const text = await tesseract.recognize(image, {
              lang: "chi_tra",
              oem: 1,
              psm: 3,
            });

            res.send({
              status: true,
              message: text,
            });
          } catch (e) {
            console.log("---->", e);
            res.status(500).send(e);
          }
        }
      }
    } catch (err) {
      console.log("imageOcr err--->", err);
      res.status(500).send(err);
    }
  });

  //https 의존성으로 certificate와 private key로 새로운 서버를 시작
  https.createServer(options, app).listen(httpsPort, () => {
    console.log(`HTTPS server started on port ${httpsPort}`);
  });

  app.get("/cafe24/token1", (req, res) => {
    try {
      mallid = req.query.mallid;
      const scope =
        "mall.read_category,mall.write_category,mall.write_collection,mall.read_order,mall.write_order,mall.read_product,mall.write_product,mall.read_salesreport,mall.read_shipping,mall.write_shipping,mall.read_community";
      // const scope = "mall.read_order"
      const url = `https://${mallid}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${CLIENT_ID1}&redirect_uri=${REDIRECT_URL1}&scope=${scope}`;

      res.redirect(url);
    } catch (e) {
      res.json({ error: e });
    }
  });
  app.get("/cafe24/token2", (req, res) => {
    try {
      mallid = req.query.mallid;
      const scope =
        "mall.read_category,mall.write_category,mall.write_collection,mall.read_order,mall.write_order,mall.read_product,mall.write_product,mall.read_salesreport,mall.read_shipping,mall.write_shipping,mall.read_community";
      // const scope = "mall.read_order"
      const url = `https://${mallid}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${CLIENT_ID2}&redirect_uri=${REDIRECT_URL2}&scope=${scope}`;

      res.redirect(url);
    } catch (e) {
      res.json({ error: e });
    }
  });
  app.get("/cafe24/token3", (req, res) => {
    try {
      mallid = req.query.mallid;
      const scope =
        "mall.read_category,mall.write_category,mall.write_collection,mall.read_order,mall.write_order,mall.read_product,mall.write_product,mall.read_salesreport,mall.read_shipping,mall.write_shipping,mall.read_community";
      // const scope = "mall.read_order"
      const url = `https://${mallid}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${CLIENT_ID3}&redirect_uri=${REDIRECT_URL3}&scope=${scope}`;

      res.redirect(url);
    } catch (e) {
      res.json({ error: e });
    }
  });

  app.get("/cafe24/token/callbak1", async (req, res) => {
    try {
      const code = req.query.code;
      const response = await getAccessToken1(code);
      if (response) {
        // const { access_token, refresh_token } = res.json({ access_token, refresh_token, scopes })
        res.json(response);
      } else {
        res.json({ access_token: "", refresh_token: "", scopes: [] });
      }
    } catch (e) {
      res.json({ access_token: "", refresh_token: e, scopes: [] });
    }
  });
  app.get("/cafe24/token/callbak2", async (req, res) => {
    const code = req.query.code;
    const response = await getAccessToken2(code);

    if (response) {
      // const { access_token, refresh_token } = res.json({ access_token, refresh_token, scopes })
      res.json(response);
    } else {
      res.json({ access_token: "", refresh_token: "", scopes: [] });
    }
  });
  app.get("/cafe24/token/callbak3", async (req, res) => {
    const code = req.query.code;
    const response = await getAccessToken3(code);

    if (response) {
      // const { access_token, refresh_token } = res.json({ access_token, refresh_token, scopes })
      res.json(response);
    } else {
      res.json({ access_token: "", refresh_token: "", scopes: [] });
    }
  });

  app.post("/taobao/cookie", async (req, res) => {
    try {
      const { nick, cookie } = req.body;
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
      );
    } catch (e) {
      console.log("/taobao/cookie", e);
    } finally {
      res.json({ succuess: "ok" });
    }
  });

  app.get("/naver/brand", async (req, res) => {
    try {
      const brandList = await Brand.find(
        {
          brand: { $ne: null },
        },
        { brand: 1 }
      );

      const response = brandList.map((item) => item.brand.trim());
      res.json(response);
    } catch (e) {
      // console.log("attribute", e);
      res.json([]);
      return;
    }
  });
  app.get("/naver/attribute", async (req, res) => {
    const { categoryID } = req.query;
    if (!categoryID) {
      res.json([]);
      return;
    }
    const token = await getToken();
    if (!token) {
      res.json([]);
      return;
    }
    let attribute = [];
    try {
      attribute = await axios({
        url: `https://api.commerce.naver.com/external/v1/product-attributes/attributes?categoryId=${categoryID}`,
        method: "GET",
        headers: {
          Authorization: `${token.token_type} ${token.access_token}`,
          "content-type": "application/json",
        },
      });
    } catch (e) {
      // console.log("attribute", e);
      res.json([]);
      return;
    }

    let attributeValue = [];

    try {
      attributeValue = await axios({
        url: `https://api.commerce.naver.com/external/v1/product-attributes/attribute-values?categoryId=${categoryID}`,
        method: "GET",
        headers: {
          Authorization: `${token.token_type} ${token.access_token}`,
          "content-type": "application/json",
        },
      });
    } catch (e) {
      // console.log("attributeValue", e);
    }
    let unitValue = [];
    try {
      unitValue = await axios({
        url: `https://api.commerce.naver.com/external/v1/product-attributes/attribute-value-units`,
        method: "GET",
        headers: {
          Authorization: `${token.token_type} ${token.access_token}`,
          "content-type": "application/json",
        },
      });
    } catch (e) {
      // console.log("unitValue", e);
    }

    for (const item of attribute.data) {
      const findObj = _.filter(attributeValue.data, {
        attributeSeq: item.attributeSeq,
      });
      if (findObj) {
        for (const value of findObj) {
          if (value.minAttributeValueUnitCode) {
            const findValue = _.find(unitValue.data, {
              id: value.minAttributeValueUnitCode,
            });
            if (findValue) {
              value.minUnitCodeName = findValue.unitCodeName;
            }
          }
          if (value.maxAttributeValueUnitCode) {
            const findValue = _.find(unitValue.data, {
              id: value.maxAttributeValueUnitCode,
            });
            if (findValue) {
              value.maxUnitCodeName = findValue.unitCodeName;
            }
          }
        }
        item.values = findObj;
      }
    }

    res.json(attribute.data);
  });

  app.get("/naver/keywordTags", async (req, res) => {
    try {
      const { keyword } = req.query;
      if (!keyword) {
        res.json([]);
        return;
      }
      const token = await getToken();
      if (!token) {
        res.json([]);
        return;
      }
      const keywrodTags = await axios({
        url: `https://api.commerce.naver.com/external/v2/tags/recommend-tags?keyword=${encodeURI(
          keyword
        )}`,
        method: "GET",
        headers: {
          Authorization: `${token.token_type} ${token.access_token}`,
          "content-type": "application/json",
        },
      });
      res.json(keywrodTags.data);
    } catch (e) {
      console.log("무슨 에러", e);
      res.json([]);
    }
  });
};

startServer();
database();

const gifyPromise = (a, b) => {
  return new Promise((resolve, reject) => {
    gify(
      a,
      b,
      {
        // width: 100,
        // rate: 4,
        // start: 4,
        // duration: 6
      },
      function (err) {
        //  fs.unlink(path.join(UPLOAD, fileName))
        fs.unlinkSync(a);
        if (err) {
          console.log("err0", err);
          reject(err);
        } else {
          resolve(b);
        }
      }
    );
  });
};

const getAccessToken1 = async (code) => {
  try {
    const auth = nodeBase64.encode(`${CLIENT_ID1}:${SECRET_KEY1}`);
    let payload = `grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URL1}`;
    let options = {
      method: "POST",
      url: `https://${mallid}.cafe24api.com/api/v2/oauth/token`,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
      json: true,
    };

    let response = await request(options);

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
    );
    return response;
  } catch (e) {
    console.log("getAccessToken", e);
    return null;
  }
};

const getAccessToken2 = async (code) => {
  try {
    const auth = nodeBase64.encode(`${CLIENT_ID2}:${SECRET_KEY2}`);
    let payload = `grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URL2}`;
    let options = {
      method: "POST",
      url: `https://${mallid}.cafe24api.com/api/v2/oauth/token`,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
      json: true,
    };

    let response = await request(options);

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
    );
    return response;
  } catch (e) {
    console.log("getAccessToken2", e);
    return null;
  }
};
const getAccessToken3 = async (code) => {
  try {
    const auth = nodeBase64.encode(`${CLIENT_ID3}:${SECRET_KEY3}`);
    let payload = `grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URL3}`;
    let options = {
      method: "POST",
      url: `https://${mallid}.cafe24api.com/api/v2/oauth/token`,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
      json: true,
    };

    let response = await request(options);

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
    );
    return response;
  } catch (e) {
    console.log("getAccessToken3", e);
    return null;
  }
};

const getAccessTokenWithRefreshToken1 = async () => {
  try {
    const tokenList = await AccessToken.find({ tokenType: 1 });
    for (const item of tokenList) {
      try {
        const auth = nodeBase64.encode(`${CLIENT_ID1}:${SECRET_KEY1}`);
        let payload = `grant_type=refresh_token&refresh_token=${item.refresh_token}`;
        let options = {
          method: "POST",
          url: `https://${item.mall_id}.cafe24api.com/api/v2/oauth/token`,
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: payload,
          json: true,
        };

        let response = await request(options);

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
        );
      } catch (e) {
        console.log("getAccessTokenWithRefreshToken1", e);
      }
    }
  } catch (e) {
    console.log("getAccessTokenWithRefreshToken", e);
  }
};
const getAccessTokenWithRefreshToken2 = async () => {
  try {
    const tokenList = await AccessToken.find({ tokenType: 2 });
    for (const item of tokenList) {
      try {
        const auth = nodeBase64.encode(`${CLIENT_ID2}:${SECRET_KEY2}`);
        let payload = `grant_type=refresh_token&refresh_token=${item.refresh_token}`;
        let options = {
          method: "POST",
          url: `https://${item.mall_id}.cafe24api.com/api/v2/oauth/token`,
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: payload,
          json: true,
        };

        let response = await request(options);

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
        );
      } catch (e) {
        console.log("getAccessTokenWithRefreshToken2", e);
      }
    }
  } catch (e) {
    console.log("getAccessTokenWithRefreshToken", e);
  }
};
const getAccessTokenWithRefreshToken3 = async () => {
  try {
    const tokenList = await AccessToken.find({ tokenType: 3 });
    for (const item of tokenList) {
      try {
        const auth = nodeBase64.encode(`${CLIENT_ID3}:${SECRET_KEY3}`);
        let payload = `grant_type=refresh_token&refresh_token=${item.refresh_token}`;
        let options = {
          method: "POST",
          url: `https://${item.mall_id}.cafe24api.com/api/v2/oauth/token`,
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: payload,
          json: true,
        };

        let response = await request(options);

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
        );
      } catch (e) {
        console.log("getAccessTokenWithRefreshToken2", e);
      }
    }
  } catch (e) {
    console.log("getAccessTokenWithRefreshToken", e);
  }
};

const searchNaverItem = async () => {
  while (true) {
    try {
      const naverMalls = await NaverMall.aggregate([
        {
          $match: {
            // seachLabel: 1,
            // productCount: { $gt: 0 },
            businessName: { $ne: "휴먼회원" },
            channelID: { $ne: null },
          },
        },
      ]);

      for (const items of DimensionArray(naverMalls, 20)) {
        try {
          await sleep(2000);

          const promiseArray = items.map((item, index) => {
            return new Promise(async (resolve, reject) => {
              try {
                // console.log("mallName", `${i * index * 20 + index} / ${naverMalls.length}`, item.mallName)
                const response = await getNaverRecommendShopping({
                  _id: item._id,
                  channelID: item.channelID,
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
                  isJapan: item.seachLabel === 11,
                  brandUrl: item.brandUrl,
                });

                // if (Array.isArray(response) && response.length > 0) {
                //   for (const naverItem of response) {
                //     console.log("naverItem", naverItem)
                //     // console.log("naverItem.originArea", naverItem.originArea)

                //     try {
                //       if (naverItem.originArea === "일본") {
                //         await NaverJapanItem.findOneAndUpdate(
                //           {
                //             // userID: ObjectId("5f0d5ff36fc75ec20d54c40b"),
                //             productNo: naverItem.productNo,
                //           },
                //           {
                //             $set: {
                //               // userID: ObjectId("5f0d5ff36fc75ec20d54c40b"),
                //               productNo: naverItem.productNo,
                //               displayName: naverItem.displayName,
                //               detailUrl: naverItem.detailUrl,
                //               name: naverItem.name,
                //               title: naverItem.name.replace(/ /gi, ""),
                //               categoryId: naverItem.categoryId,
                //               category1: naverItem.category1,
                //               category2: naverItem.category2,
                //               category3: naverItem.category3,
                //               category4: naverItem.category4,
                //               salePrice: Number(naverItem.salePrice) ? Number(naverItem.salePrice) : 0,
                //               regDate: naverItem.regDate,
                //               image: naverItem.image,
                //               sellerTags: naverItem.sellerTags,
                //               reviewCount: naverItem.reviewCount,
                //               zzim: naverItem.zzim,
                //               purchaseCnt: naverItem.purchaseCnt,
                //               recentSaleCount: naverItem.recentSaleCount,
                //               zzim: naverItem.zzim,
                //               createdAt: moment().toDate(),
                //             },
                //           },
                //           {
                //             upsert: true,
                //             new: true,
                //           }
                //         )
                //       } else {
                //         await NaverFavoriteItem.findOneAndUpdate(
                //           {
                //             // userID: ObjectId("5f0d5ff36fc75ec20d54c40b"),
                //             productNo: naverItem.productNo,
                //           },
                //           {
                //             $set: {
                //               // userID: ObjectId("5f0d5ff36fc75ec20d54c40b"),
                //               productNo: naverItem.productNo,
                //               displayName: naverItem.displayName,
                //               detailUrl: naverItem.detailUrl,
                //               name: naverItem.name,
                //               title: naverItem.name.replace(/ /gi, ""),
                //               categoryId: naverItem.categoryId,
                //               category1: naverItem.category1,
                //               category2: naverItem.category2,
                //               category3: naverItem.category3,
                //               category4: naverItem.category4,
                //               salePrice: Number(naverItem.salePrice) ? Number(naverItem.salePrice) : 0,
                //               regDate: naverItem.regDate,
                //               image: naverItem.image,
                //               sellerTags: naverItem.sellerTags,
                //               reviewCount: naverItem.reviewCount,
                //               zzim: naverItem.zzim,
                //               purchaseCnt: naverItem.purchaseCnt,
                //               recentSaleCount: naverItem.recentSaleCount,
                //               zzim: naverItem.zzim,
                //               createdAt: moment().toDate(),
                //               originArea: naverItem.originArea
                //             },
                //           },
                //           {
                //             upsert: true,
                //             new: true,
                //           }
                //         )
                //       }

                //     } catch (e) {
                //       console.log("error", e)
                //     }
                //   }
                //   // naverItemList.push(...response)
                // }

                resolve();
              } catch (e) {
                console.log("Promise Error", e);
                reject(e);
              }
            });
          });
          await Promise.all(promiseArray);
        } catch (e) {}
      }
      console.log("***** 끝 *****");
    } catch (e) {
      console.log("scheduleError", e);
    }
  }
};

const searchNaverJapanItem = async () => {
  while (true) {
    try {
      const naverMalls = await NaverMall.aggregate([
        {
          $match: {
            // businessName: "뽀식재팬",
            seachLabel: 11,
          },
        },
      ]);
      console.log("naverMalls", naverMalls.length);
      let i = 1;
      let naverMallsArray = DimensionArray(naverMalls, 1);

      for (const items of naverMallsArray) {
        console.log("product--> ", `${i++} / ${naverMallsArray.length}`);
        try {
          await sleep(500);

          const promiseArray = items.map((item, index) => {
            return new Promise(async (resolve, reject) => {
              try {
                // console.log("mallName", `${i * index * 20 + index} / ${naverMalls.length}`, item.mallName)
                const response = await getNaverReviewShopping({
                  _id: item._id,
                  channelID: item.channelID,
                  channelUid: item.channelUid,
                  url: item.mallPcUrl,
                });
                // console.log("response-->", response);
                for (const product of response) {
                  console.log(
                    "product **** ",
                    product.brandName,
                    " - ",
                    product.name
                  );
                  // console.log(
                  //   "product--> ",
                  //   `${i++} / ${naverMallsArray.length}`,
                  //   product.name
                  // );
                  await NaverJapanreviewItem.findOneAndUpdate(
                    {
                      productNo: product.productNo,
                    },
                    {
                      $set: {
                        productNo: product.productNo,
                        displayName: product.displayName,
                        detailUrl: product.detailUrl,
                        name: product.name,
                        categoryId: product.categoryId,
                        category1: product.category1,
                        category2: product.category2,
                        category3: product.category3,
                        category4: product.category4,
                        categoryName: product.categoryName,
                        maxPrice: product.maxPrice,
                        minPrice: product.minPrice,
                        image: product.image,
                        purchaseCnt: product.purchaseCnt,
                        reviewCount: product.reviewCount,
                        zzim: product.zzim,
                        openDate: product.openDate,
                        originArea: product.originArea,
                        actionGrade: item.actionGrade,
                        productAttributes: product.productAttributes,
                        sellerTags: product.sellerTags,
                        manufacturerName: product.manufacturerName,
                        brandName: product.brandName,
                        brandId: product.brandId,
                        brandId: product.brandId,
                        monthlyCnt: product.monthlyCnt,
                      },
                    },
                    { upsert: true }
                  );
                }
                resolve();
              } catch (e) {
                console.log("Promise Error", e);
                reject(e);
              }
            });
          });
          await Promise.all(promiseArray);
        } catch (e) {
          console.log("혹시 여기", e);
        }
      }

      console.log("------------ 끝 -------------");
    } catch (e) {
      console.log("searchNaverJapanItem", e);
    }
  }
};

const getChannelID = async () => {
  try {
    const naverMalls = await NaverMall.aggregate([
      {
        $match: {
          channelUid: null,
        },
        // $sort: {
        //   _id: 1,
        // },
      },
    ]);

    console.log("cccc", naverMalls.length);
    for (const items of DimensionArray(naverMalls, 20)) {
      const promiseArray = items.map((item, index) => {
        return new Promise(async (resolve, reject) => {
          try {
            const content = await axios.get(item.mallPcUrl);

            const temp1 = content.data.split("window.__PRELOADED_STATE__=")[1];
            const temp2 = temp1.split("<span")[0].trim();
            const temp21 = temp2.split("</script>")[0].trim();

            const jsObj = JSON.parse(temp21);
            if (jsObj && jsObj.smartStoreV2) {
              const { channel } = jsObj.smartStoreV2;
              console.log(
                "item.",
                channel.id,
                channel.channelName,
                channel.channelUid
              );
              await NaverMall.findOneAndUpdate(
                {
                  _id: item._id,
                },
                {
                  $set: {
                    channelID: channel.id,
                    channelUid: channel.channelUid,
                  },
                },
                {
                  upsert: true,
                }
              );
            } else if (jsObj && jsObj.bsProductCollection) {
              const bestProduts = jsObj.bsProductCollection.A.bestProducts;
              if (bestProduts.length > 0) {
                console.log(
                  "item.",
                  bestProduts[0].channel.channelNo,
                  bestProduts[0].channel.channelName,
                  bestProduts[0].channel.channelUid
                );
                await NaverMall.findOneAndUpdate(
                  {
                    _id: item._id,
                  },
                  {
                    $set: {
                      channelID: bestProduts[0].channel.channelNo,
                      channelUid: bestProduts[0].channel.channelUid,
                    },
                  },
                  {
                    upsert: true,
                  }
                );
              }
            }

            await sleep(1000);

            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
      await Promise.all(promiseArray);
      await sleep(2000);
    }

    console.log("----- 끝 -----");
  } catch (e) {
    console.log("getChannelID error", e);
  }
};

const getBrandSales = async () => {
  try {
    const brandKeywords = [
      "이세이미야케미",
      "알라딘",
      "오어슬로우",
      "NIKKEN",
      "요넥스",
      "윌슨",
      "오니츠카타이거",
      "닌텐도",
      "웨어하우스",
      "테일러메이드",
      "컨버스",
      "미즈노",
      "KEEN",
      "ARTISAN",
      "문스타",
      "헌터",
      "아슬레타",
      "CICIBELLA 마스크",
      "스노우피크",
      "KIRIN",
      "타이틀리스트",
      "아사히카세이",
      "비비안웨스트우드",
      "무인양품",
      "호카오네오네",
      "풀카운트",
      "4w1h",
      "WBSJ",
      "반스",
      "산요",
      "Yamazaki",
      "아레나",
      "푸마",
      "포켓몬스터",
      "토요토미",
      "LION",
      "snow peak",
      "에포크",
      "씨빅",
      "플리츠플리즈",
      "파나소닉",
      "DOD",
      "캘러웨이",
      "소리야나기",
      "써코니",
      "프릭스스토어",
      "소토",
      "콜맨",
      "바볼랏",
      "코닥",
      "오디세이",
      "노다호로",
      "우스하리",
      "니들스",
      "버즈릭슨",
      "스투시",
      "미노야끼",
      "BARNS OUTFITTERS",
      "Wilson",
      "야마자키",
      "교세라",
      "이와타니",
      "토이즈맥코이",
      "후지필름",
      "mizuho",
      "wanderout",
      "로제트",
      "젝시오",
      "짐빔",
      "KAIKAI KIKI",
      "써모스",
      "Maiko",
      "앰비",
      "고세",
      "이사미",
      "프랑프랑",
      "나가노",
      "와이엠씨엘케이와이",
      "라바제",
      "오라리",
      "F/CE",
      "마가렛호웰",
      "요시카와",
      "소후란",
      "Miffy",
      "원더아웃",
      "포터",
      "마츠나가",
      "스탬플",
      "화이츠빌",
      "사나",
      "요시히로",
      "소니",
      "혼마",
      "미이세이미야케",
      "Ambai",
      "옵텍스",
      "유니프레임",
      "꼼데가르송",
      "챔피온",
      "레노아",
      "버켄스탁",
      "펠리칸",
      "타비오",
      "오디너리핏츠",
      "38explore",
      "에버뉴",
      "KUREHA",
      "프리휠러스",
      "캡틴스태그",
      "BEAMS",
      "노스페이스",
      "야마하",
      "란도린",
      "PXG",
      "PILOT",
      "NEEDLES",
      "이와키",
      "VIEW",
      "미즈호",
      "엔지니어드가먼츠",
      "노르디스크",
      "살로몬",
      "FREAKS STORE",
      "뉴에라",
      "니콘",
      "WHATNOT",
      "플레이스테이션",
      "미 이세이미야케",
      "Silky",
      "신존",
      "크록스",
      "써모스(THERMOS)",
      "엔젤하트",
      "브리지스톤",
      "Hender Scheme",
      "아에타",
      "아웃스탠딩",
      "키와메",
      "사브리나",
      "Niko and",
      "WPC",
      "발리스틱스",
      "네이탈 디자인",
      "FAFA",
      "네이버후드",
      "irma",
      "콜맨(Coleman)",
      "엠펙스",
      "헤드",
      "번독",
      "혼마제작소",
      "토르",
      "노스페이스퍼플라벨",
      "풋조이",
      "디젤",
      "KTC",
      "솔텍",
      "라이온",
      "오르치발",
      "아리타",
      "고신",
      "겐타",
      "타케이",
      "펜텔",
      "에비스",
      "아뜰리에 페넬로페",
      "스피도",
      "요시다포터",
      "레졸루트",
      "토모에리버",
      "럭실론",
      "FRANCFRANC",
      "리첼",
      "우포스",
      "버터플라이",
      "아리타야끼",
      "엘레컴",
      "카웨코",
      "네루 디자인 웍스",
      "SOUTH2 WEST8",
      "코신",
      "첨스",
      "유니클로",
      "클리브랜드",
      "LEC",
      "니혼코도",
      "포틴",
      "PEANUTS",
      "Thor",
      "씨게이트",
      "칼리타",
      "DAD 가르송",
      "아사히슈즈",
      "리얼맥코이",
      "devise works",
      "COMOLI",
      "아시모크래프트",
      "RICOH",
      "DANTON",
      "Gourmandise",
      "조지루시",
      "Kosin",
      "소우소우",
      "츠키우사기지루시",
      "굿온",
      "테크니화이버",
      "닛토",
      "시마노",
      "닛타쿠",
      "하루타",
      "베이프",
      "트리빗",
      "베이크루",
      "토리베",
      "샤프톤",
      "바커스",
      "로지텍",
      "레어잼",
      "에어버기",
      "세이코",
      "Etimo",
      "플래닛",
      "르탈론",
      "아미아칼바",
      "다이와",
      "몽벨",
      "고든밀러",
      "발뮤다",
      "kapital",
      "스누피",
      "앤드원더",
      "바직",
      "nanamica",
      "가라대관",
      "카시라",
      "wpc",
      "45R",
      "하사미야끼",
      "텐트마크",
      "가오바부",
      "오레고니안 캠퍼",
      "GU",
      "화이텐",
      "핑",
      "시모무라",
      "기모토유리",
      "BRID",
      "NESTOUT",
      "Loto",
      "니키",
      "FREEWHEELERS",
      "neru design works",
      "카시오",
      "mature ha",
      "오판츄우사기",
      "CIELO",
      "andwander",
      "BoYata",
      "auralee",
      "와코마리아",
      "헬리오스",
      "와콤",
      "브리타",
      "asics",
      "부코",
      "노사쿠",
      "KOGU",
      "TITAN MANIA",
      "노티카",
      "mhl",
      "암바이",
      "가르송 DAD",
      "엘엘빈",
      "콜드스틸",
      "racal",
      "발리스틱스 BALLISTICS",
      "헬리녹스",
      "comoli",
      "슈가케인",
      "마운틴리서치",
      "asimocrafts",
      "블루보틀",
      "HYSTERIC GLAMOUR",
      "스케이터",
      "SEIKO",
      "스카르파",
      "베어본즈리빙",
      "안테프리마",
      "BUCO",
      "aeta",
      "오노에",
      "데상트",
      "딘앤델루카",
      "로스앤젤레스 어패럴",
      "FIELDOOR",
      "키지마타카유키",
      "미 이세이미아케",
      "카이코",
      "EMPEX",
      "아오야마",
      "DAIWA PIER39",
      "danton",
      "와헤이 프레이즈",
      "뷰",
      "YUPITERU",
      "아이자와공방",
      "EPON",
      "캠버",
      "도돌",
      "카베코",
      "BELCA",
      "Wahei freiz",
      "ADERIA",
      "텐트마크디자인",
      "오딧세이",
      "지포어",
      "Ohuhu",
      "에치젠칠기",
      "기무라 글라스",
      "리바이스",
      "MIMI Berry",
      "캡틴선샤인",
      "SALOMON",
      "하야시야",
      "HUMANMADE",
      "하리오",
      "로고스",
      "38explore 미야익스플로러",
      "클리블랜드",
      "Sasquatchfabrix",
      "피그벨",
      "Living Talk",
      "39아리타",
      "BOSS",
      "닷사이",
      "골드짐",
      "소니뮤직",
      "HARDLY-DRIVEABLE",
      "Kiwame",
      "AMIACALVA",
      "GreenBell",
      "유키시오",
      "야마모토",
      "데스포르치",
      "KAI",
      "MIZUNO(ミズノ)",
      "바차리스",
      "카메노코",
      "MOONSTAR",
      "와헤이",
      "BEAMS PLUS",
      "FX-AUDIO-",
      "QUICKCAMP",
      "미나페르호넨",
      "그립스와니",
      "퓨마",
      "Toyo",
      "daiwa",
      "SHAPTON",
      "south2 west8",
      "The REAL McCOYS",
      "SSK",
      "AURALEE",
      "Hario",
      "하츠키",
      "GLADHAND",
      "뷰 블레이드F",
      "워너뮤직재팬",
      "나탈 디자인 NATAL DESIGN",
      "ZANEARTS 제인아츠",
      "몰텐",
      "이스트팩",
      "엔지니어(ENGINEER)",
      "컨버스 재팬",
      "butterfly",
      "미즈노골프",
      "타이온",
      "RHODOLIRION",
      "헨더스킴",
      "cableami",
      "oma factory",
      "지포",
      "YAMASHITA",
      "CHACOLI",
      "홀베인",
      "KIJIMA",
      "CASIO",
      "RANDA",
      "Veritecoeur",
      "타니타",
      "츠보타",
      "로트링",
      "킨",
      "시마노 (SHIMANO)",
      "이하다",
      "칼하트",
      "브릿지스톤",
      "캐피탈",
      "프록슨",
      "빅타스",
      "오레고니안 캠퍼 Oregonian Camper",
      "THRASHER",
      "스릭슨",
      "에티모",
      "이세이미야케미",
      "SOTO X MOGOTI",
      "먼싱웨어",
      "KINTO",
      "시비",
      "디바이스웍스 DEVISE WORKS",
      "릿첼",
      "타카기",
      "레이메이",
      "Wpc.",
      "KORG",
      "아스레타",
      "아케보노",
      "헹켈",
      "던롭",
      "KAPITAL",
      "Gamakatsu",
      "포터클래식",
      "NATAL DESIGN",
      "타이거-K",
      "타지마 글라스",
      "벨카",
      "디베르그",
      "WHITESVILLE",
      "yamashita",
      "아나토미카",
      "FUJIFILM",
      "ONOE",
      "INOUT",
      "Captain Stag",
      "ARTS & SCIENCE",
      "유니프레임 uniflame",
      "STUDIO D'ARTISAN",
      "HAWKINS",
      "하사미소",
      "HARIO",
      "WILSON",
      "Dulton",
      "이가모노",
      "MHL",
      "AKIKOAOKI",
      "엔지니어",
      "호보니치",
      "neru design works 네루디자인웍스",
      "HUNTER",
      "질스튜어트",
      "Artisan",
      "카브엠트",
      "후지쿠라",
      "PORTER CLASSIC",
      "제브라",
      "BUZZ RICKSONS",
      "지아니끼아리니",
      "JOE MCCOY'S",
      "THE REAL McCOYS",
      "CAMP OOPARTS",
      "LOCKFIELD EQUIPMENT 락필드 에큅먼트",
      "이와키 iwaki",
      "PRGR",
      "DOSHISHA",
      "mature ha.",
      "URBAN RESEARCH Sonny Label",
      "TIGER 타이거",
      "REAL McCOYS",
      "AbuGarcia",
      "Insole Pro",
      "nemo",
      "야마코",
      "빅토리녹스",
      "Zamst",
      "산조 코무텐",
      "토이즈 맥코이",
      "MARKA",
      "GULL",
      "FREAK'S STORE",
      "조맥코이",
      "Kai",
      "zanearts",
      "SIERRA DESIGNS",
      "벨몬트",
      "JOURNAL STANDARD",
      "무민",
      "반스아웃피터스",
      "파커아사히",
      "OIGEN",
      "찰스앤키스",
      "프록스",
      "데상트골프",
      "Ateliers penelope",
      "바토너",
      "ZETT",
      "야마시타",
      "토레이",
      "쯔리겐",
      "오즈리",
      "사사메",
      "메가배스",
      "가마가츠",
      "썬라인",
      "키자쿠라",
      "SRIXON",
      "XXIO",
      "HONMA",
      "마루망",
      "브릿지스톤",
      "투어스테이지",
      "그랑프리",
      "포틴",
      "히로마쓰모토",
    ];

    const getShoppingList = async (keyword) => {
      let pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      let shoppingList = [];
      let brand = null;
      let brandNo = null;
      let purchaseCnt = 0;
      let totalPrice = 0;
      try {
        const response = await NaverKeywordRel({
          keyword: keyword,
        });
        let monthlyCnt = 0;
        let overSeeCount = 0;
        let totalCount = 0;

        if (response && response.keywordList) {
          isLoading = false;

          const findObj = _.find(response.keywordList, {
            relKeyword: keyword,
          });
          if (findObj) {
            let monthlyPcQcCnt = Number(
              findObj.monthlyPcQcCnt.toString().replace("< ", "")
            );
            let monthlyMobileQcCnt = Number(
              findObj.monthlyMobileQcCnt.toString().replace("< ", "")
            );
            monthlyCnt = monthlyPcQcCnt + monthlyMobileQcCnt;
          }
        }

        for (const page of pages) {
          try {
            await sleep(2000);
            const shoppingResponse = await axios.get(
              `https://search.shopping.naver.com/api/search/all?eq=&frm=NVSHOVS&iq=&&pagingIndex=${page}&pagingSize=80&productSet=overseas&query=${encodeURI(
                keyword
              )}&sort=rel&viewType=list&window=&xq=`,
              {
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36",
                  "sec-fetch-site": "same-origin",
                  "sec-fetch-mode": "cors",
                  "Accept-Encoding": "gzip, deflate, br",
                  Connection: "keep-alive",
                  "Cache-Control": "no-cache",
                  Pragma: "no-cache",
                  Expires: "0",
                  referer: `https://search.shopping.naver.com/`,
                  sbth: getSbth(),
                },
              }
            );

            if (page === 1) {
              totalCount = shoppingResponse.data.shoppingResult.orgQueryTotal;
              overSeeCount = shoppingResponse.data.shoppingResult.total;
            }

            let purchaseProducts =
              shoppingResponse.data.shoppingResult.products.filter(
                (item) => item.purchaseCnt > 0
              );
            if (purchaseProducts.length > 0) {
              shoppingList.push(
                ...shoppingResponse.data.shoppingResult.products
              );
            }
          } catch (e) {}
        }

        // // BrandKeyword

        const brandArr = shoppingList
          .filter((item) => item.brand.length > 0 && item.brandNo.length > 0)
          .map((item) => item.brand);
        // console.log("brandArr", brandArr);
        const brandRanking = ranking(brandArr);

        if (brandRanking && brandRanking.length > 0) {
          brand = brandRanking[0].name;
          const temp = shoppingList.filter(
            (item) => item.brand === brand && item.brandNo.length > 0
          );
          if (temp.length > 0) {
            brandNo = temp[0].brandNo;
          }
        }

        shoppingList.map((item) => {
          purchaseCnt += item.purchaseCnt;
          totalPrice += item.purchaseCnt * item.lowPrice;
        });

        return {
          brand,
          brandNo,
          purchaseCnt,
          totalPrice,
          overSeeCount,
          totalCount,
          monthlyCnt,
          searchRate: Number(((monthlyCnt / totalCount) * 100).toFixed(2)) || 0,
          overSerRate:
            Number(((overSeeCount / totalCount) * 100).toFixed(2)) || 0,
        };
      } catch (e) {
        console.log("eee", e);
      }
    };
    let i = 1;
    for (const keyword of brandKeywords) {
      console.log(
        "keywrod 시작 --> ",
        i++,
        "/",
        brandKeywords.length,
        " ",
        keyword
      );
      let response = await getShoppingList(keyword);

      if (response && response.brand !== keyword) {
        response = await getShoppingList(response.brand);
      }
      console.log(response);
      if (response && response.brandNo) {
        await BrandKeyword.findOneAndUpdate(
          {
            brand: response.brand,
            brandNo: response.brandNo,
          },
          {
            $set: {
              brand: response.brand,
              brandNo: response.brandNo,
              purchaseCnt: response.purchaseCnt,
              totalPrice: response.totalPrice,
              overSeeCount: response.overSeeCount,
              totalCount: response.totalCount,
              monthlyCnt: response.monthlyCnt,
              searchRate: response.searchRate,
              overSerRate: response.overSerRate,
              type: "일반",
            },
          },
          {
            upsert: true,
          }
        );
      }

      await sleep(2000);
    }

    console.log("--------- 끝 -----------");
  } catch (e) {
    console.log("getBrandSales ", e);
  }
};
// GetSeasonKeyword({ keyword: "조립식닭장" })

setTimeout(() => {
  try {
    getAccessTokenWithRefreshToken1();
  } catch (e) {}
  try {
    getAccessTokenWithRefreshToken2();
  } catch (e) {}
  try {
    getAccessTokenWithRefreshToken3();
  } catch (e) {}
  try {
    // searchNaverItem();
    // searchNaverJapanItem();
    // getChannelID();
    // getBrandSales();
  } catch (e) {}
}, 1000);

setInterval(async function () {
  try {
    getAccessTokenWithRefreshToken1();
  } catch (e) {}
  try {
    getAccessTokenWithRefreshToken2();
  } catch (e) {}
  try {
    getAccessTokenWithRefreshToken3();
  } catch (e) {}
}, 20 * 60 * 1000);
