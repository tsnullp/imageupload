const probe = require("probe-image-size");
const url = require("url");
const path = require("path");
const bcrypt = require("bcrypt");
const axios = require("axios");
const crypto = require("crypto");
const moment = require("moment");

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
    const timestamp = Number(moment().add(-10, "seconds"));
    // console.log("timestamp", timestamp);
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
    console.log("3333,", e.response.data);
    return null;
  }
};

const getMonthName = (month) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return monthNames[parseInt(month) - 1];
};

const getSbth = () => {
  const algorithm = "aes-256-cbc";
  const key = Buffer.from("12501986019234170293715203984170", "utf8");
  const iv = Buffer.from("6269036102394823", "utf8");

  const date = new Date();
  const year = date.getUTCFullYear();
  const month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
  const day = ("0" + date.getUTCDate()).slice(-2);
  const hours = ("0" + date.getUTCHours()).slice(-2);
  const minutes = ("0" + date.getUTCMinutes()).slice(-2);
  const seconds = ("0" + date.getUTCSeconds()).slice(-2);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekday = weekdays[date.getUTCDay()];

  const dateString = `${weekday}, ${day} ${getMonthName(
    month
  )} ${year} ${hours}:${minutes}:${seconds} GMT`;

  const plaintext = `sb${dateString}th`;

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
};

const ranking = (array, count = 3) => {
  if (!Array.isArray(array)) {
    return [];
  }
  const res = array.reduce((t, a) => {
    if (t[a]) {
      t[a]++;
    } else {
      t[a] = 1;
    }
    return t;
  }, {});

  const arrayValue = Object.keys(res).map((item) => {
    return {
      name: item,
      count: res[item],
    };
  });
  const sortArray = arrayValue.sort((a, b) => b.count - a.count);

  return sortArray.filter((item) => item.count >= count);
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
  getSbth,
  ranking,
};
