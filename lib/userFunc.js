const probe = require("probe-image-size");
const url = require("url");
const path = require("path");
const bcrypt = require("bcrypt");
const axios = require("axios");

const sleep = (t) => {
  return new Promise((resolve) => setTimeout(resolve, t));
};
const checkStr = (str, para, type) => {
  if (type) {
    if (str.includes(para)) {
      return true;
    } else {
      return false;
    }
  } else {
    if (!str.includes(para)) {
      return true;
    } else {
      return false;
    }
  }
};

const regExp_test = (str) => {
  //함수를 호출하여 특수문자 검증 시작.
  try {
    // eslint-disable-next-line no-useless-escape
    var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
    if (regExp.test(str)) {
      var t = str.replace(regExp, "");
      //특수문자를 대체. ""

      return t;
      //특수문자 제거. ==>20171031
    } else {
      return str;
    }
  } catch (e) {
    return str;
  }
};
const imageCheck = (path) => {
  return new Promise((resolve, reject) => {
    probe(path)
      .then((result) => {
        resolve({
          width: result.width,
          height: result.heigh,
        });
      })
      .catch((e) => reject(e));
  });
};

const AmazonAsin = (addr) => {
  try {
    if (!addr) {
      return null;
    }

    if (addr.includes("amazon.com")) {
      const q1 = url.parse(addr, true);
      const temp1 = q1.pathname.split("/dp/");
      const temp2 = temp1[temp1.length - 1];
      const temp3 = temp2.split("/")[0];
      return temp3;
    } else if (addr.includes("iherb.com")) {
      const tmepUrl = addr.split("?")[0];
      const q1 = url.parse(tmepUrl, true);
      const temp1 = q1.pathname.split("/")[q1.pathname.split("/").length - 1];
      return temp1;
    }

    return null;
  } catch (e) {
    console.log("AmazonAsin", e);
    return null;
  }
};

const getAppDataPath = () => {
  switch (process.platform) {
    case "darwin": {
      return path.join(
        process.env.HOME,
        "Library",
        "Application Support",
        "SmartSellerServer"
      );
    }
    case "win32": {
      return path.join(process.env.APPDATA, "SmartSellerServer");
    }
    case "linux": {
      return path.join(process.env.HOME, ".SmartSellerServer");
    }
    default: {
      console.log("Unsupported platform!");
      process.exit(1);
    }
  }
};

const DimensionArray = (array, criteria = 1) => {
  try {
    if (!Array.isArray(array)) {
      return array;
    }
    return array.reduce((array, number, index) => {
      const arrayIndex = Math.floor(index / criteria);
      if (!array[arrayIndex]) {
        array[arrayIndex] = [];
      }
      array[arrayIndex] = [...array[arrayIndex], number];
      return array;
    }, []);
  } catch (e) {
    console.log("DimensionArray", e);
    return array;
  }
};

const shuffle = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const getToken = async () => {
  try {
    const clientId = "3xL2y5DqrklF3Gmpnd5z6m";
    const clientSecret = "$2a$04$QtYjezKbjnCVbnGC9lFy5.";
    const timestamp = Number(new Date());

    // 밑줄로 연결하여 password 생성
    const password = `${clientId}_${timestamp}`;
    // bcrypt 해싱
    const hashed = bcrypt.hashSync(password, clientSecret);
    // base64 인코딩
    const hashCode = Buffer.from(hashed, "utf-8").toString("base64");

    const response = await axios({
      url: `https://api.commerce.naver.com/external/v1/oauth2/token`,
      method: "POST",
      params: {
        client_id: clientId,
        timestamp,
        client_secret_sign: hashCode,
        grant_type: "client_credentials",
        type: "SELF",
      },
    });

    if (response && response.status === 200) {
      return response.data;
    }
  } catch (e) {
    console.log("3333,", e);
    return null;
  }
};

module.exports = {
  sleep,
  checkStr,
  regExp_test,
  imageCheck,
  AmazonAsin,
  getAppDataPath,
  DimensionArray,
  shuffle,
  getToken,
};
