const axios = require("axios")
const CryptoJS = require("crypto-js")

exports.NaverKeywordRel = async ({ keyword }) => {
    try {
      const method = "GET"
      const api_url = "/keywordstool"
      const timestamp = Date.now() + ""
      const accessKey = "01000000006efb6afaca2d8a26090491141ea2a9bf8f580af6f998aa7db6599fb747def271"
      const secretKey = "AQAAAABu+2r6yi2KJgkEkRQeoqm/qjYU5KwW9QuEz2Cgh/jDvQ=="
      const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey)
      hmac.update(timestamp + "." + method + "." + api_url)
      const hash = hmac.finalize()
      hash.toString(CryptoJS.enc.Base64)
  
      const response = await axios({
        url: `https://api.naver.com/keywordstool?hintKeywords=${encodeURI(
          keyword.replace(/ /gi, "")
        )}&showDetail=1&month=1`,
        method,
        headers: {
          "X-Timestamp": timestamp,
          "X-API-KEY": accessKey,
          "X-API-SECRET": secretKey,
          "X-CUSTOMER": "2537298",
          "X-Signature": hash.toString(CryptoJS.enc.Base64),
          // "Content-Type": "text/json;charset=UTF-8",
          // "Content-Length": Buffer.byteLength(strjson, "utf8"),
          // Authorization: authorization,
          // "X-EXTENDED-TIMEOUT": 90000
        },
      })
      
      return response.data
    } catch (e) {
      // console.log("NaverKeywordRel", e)
      return null
    }
  }