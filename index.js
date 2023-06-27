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
  checkStr,
  regExp_test,
  imageCheck,
  AmazonAsin,
  getAppDataPath,
  DimensionArray,
  getToken,
} = require("./lib/userFunc");
const getNaverRecommendShopping = require("./puppeteer/getNaverRecommendShopping");
const getNaverReviewShopping = require("./puppeteer/getNaverReviewShopping");
const axios = require("axios");
const tesseract = require("node-tesseract-ocr");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const CLIENT_ID1 = "lv8Si6qgAV6iLJqrCCYp4B";
const CLIENT_ID2 = "7bFAHrRCBlplAcsGJEZmmD";
const CLIENT_ID3 = "seY7sh5SWCqDtzGmLZboyH";
const SECRET_KEY1 = "M8UFmAzlK50jVYCMXqrTjD";
const SECRET_KEY2 = "pOMhnUDuGFxgEekaw10IgE";
const SECRET_KEY3 = "NOq7vE2iIx2ouflwWEV2ID";
const REDIRECT_URL1 = "https://tsnullp.chickenkiller.com/cafe24/token/callbak1";
const REDIRECT_URL2 = "https://tsnullp.chickenkiller.com/cafe24/token/callbak2";
const REDIRECT_URL3 = "https://tsnullp.chickenkiller.com/cafe24/token/callbak3";
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
  app.use(bodyParser.json({ limit: "50000mb" }));
  app.use(
    bodyParser.urlencoded({
      limit: "50000mb",
      extended: true,
    })
  );

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

  http
    .createServer((req, res) => {
      // 요청 엔티티 크기 제한 설정
      req.maxPayload = 10 * 1024 * 1024 * 1024; // 100MB

      // 요청 처리
      // ...
    })
    .listen(httpPort, () => {
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
  try {
    const naverMalls = await NaverMall.aggregate([
      {
        $match: {
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
                url: item.mallPcUrl,
              });
              // console.log("response-->", response.productAttributes);
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
    searchNaverItem();
    // searchNaverJapanItem();
  } catch (e) {}
}, 10000);

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
