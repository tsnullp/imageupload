const axios = require("axios")
const fakeUa = require('fake-useragent')
const moment = require("moment")
const _ = require("lodash")
const find = async ({ url, category = "", regDay, minRecent, maxRecent, totalMinSale, totalMaxSale, minReview, maxReview, minPrice, maxPrice }) => {
  const list = []
  try {
    const userAgent = fakeUa()
  
    const content = await axios.get(url,
      {
        headers: {
          "User-Agent":
          userAgent,
          "sec-fetch-site": "same-origin",
          "sec-fetch-mode": "cors",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
          referer: "https://naver.com",
        },
      }
      )

    const temp1 = content.data.split("window.__PRELOADED_STATE__=")[1]
    const temp2 = temp1.split("<span")[0].trim()
    const temp21 = temp2.split("</script>")[0].trim()
    
    const jsObj = JSON.parse(temp21)
    
    const {channel} = jsObj.smartStoreV2

    let simpleProducts = []

    const promiseArr = [
      new Promise(async (resolve, reject) => {
        try {
          const productPOPULAR = await axios.get(
            `https://smartstore.naver.com/i/v1/stores/${channel.id}/categories/ALL/products?categoryId=ALL&categorySearchType=STDCATG&sortType=POPULAR&free=false&subscr=false&page=1&pageSize=40`,
            {
              headers: {
                "User-Agent":
                userAgent,
                "sec-fetch-site": "same-origin",
                "sec-fetch-mode": "cors",
                "Accept-Encoding": "gzip, deflate, br",
                Connection: "keep-alive",
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
                Expires: "0",
                referer: url,
                withCredentials: true,
                Host: "smartstore.naver.com"
              },
            }
          )
          simpleProducts.push(...productPOPULAR.data.simpleProducts)
          resolve()
        } catch(e){
          reject(e)
        }
      }),
      new Promise(async (resolve, reject) => {
        try {
          const productTOTALSALE = await axios.get(
            `https://smartstore.naver.com/i/v1/stores/${channel.id}/categories/ALL/products?categoryId=ALL&categorySearchType=STDCATG&sortType=TOTALSALE&free=false&subscr=false&page=1&pageSize=40`,
            {
              headers: {
                "User-Agent":
                userAgent,
                "sec-fetch-site": "same-origin",
                "sec-fetch-mode": "cors",
                "Accept-Encoding": "gzip, deflate, br",
                Connection: "keep-alive",
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
                Expires: "0",
                referer: url,
                Host: "smartstore.naver.com",
                withCredentials: true,
              },
            }
          )
          simpleProducts.push(...productTOTALSALE.data.simpleProducts)
          resolve()
        } catch(e){
          reject(e)
        }
      }),
      new Promise(async (resolve, reject) => {
        try {
          const productRECENT = await axios.get(
            `https://smartstore.naver.com/i/v1/stores/${channel.id}/categories/ALL/products?categoryId=ALL&categorySearchType=STDCATG&sortType=RECENT&free=false&subscr=false&page=1&pageSize=40`,
            {
              headers: {
                "User-Agent":
                userAgent,
                "sec-fetch-site": "same-origin",
                "sec-fetch-mode": "cors",
                "Accept-Encoding": "gzip, deflate, br",
                Connection: "keep-alive",
                "Cache-Control": "no-cache",
                Host: "smartstore.naver.com",
                Pragma: "no-cache",
                Expires: "0",
                referer: url,
                withCredentials: true,
              },
            }
          )
          simpleProducts.push(...productRECENT.data.simpleProducts)
          resolve()
        } catch(e){
          reject(e)
        }
      }),
      new Promise(async (resolve, reject) => {
        try {
          const productREVIEW = await axios.get(
            `https://smartstore.naver.com/i/v1/stores/${channel.id}/categories/ALL/products?categoryId=ALL&categorySearchType=STDCATG&sortType=REVIEW&free=false&subscr=false&page=1&pageSize=40`,
            {
              headers: {
                "User-Agent":
                userAgent,
                "sec-fetch-site": "same-origin",
                "sec-fetch-mode": "cors",
                "Accept-Encoding": "gzip, deflate, br",
                Connection: "keep-alive",
                "Cache-Control": "no-cache",
                Host: "smartstore.naver.com",
                Pragma: "no-cache",
                Expires: "0",
                referer: url,
                withCredentials: true,
              },
            }
          )
          simpleProducts.push(...productREVIEW.data.simpleProducts)
          resolve()
        } catch(e){
          reject(e)
        }
      }),
      new Promise(async (resolve, reject) => {
        try {
          const productSATISFACTION = await axios.get(
            `https://smartstore.naver.com/i/v1/stores/${channel.id}/categories/ALL/products?categoryId=ALL&categorySearchType=SATISFACTION&sortType=REVIEW&free=false&subscr=false&page=1&pageSize=40`,
            {
              headers: {
                "User-Agent":
                userAgent,
                "sec-fetch-site": "same-origin",
                "sec-fetch-mode": "cors",
                "Accept-Encoding": "gzip, deflate, br",
                Connection: "keep-alive",
                "Cache-Control": "no-cache",
                Host: "smartstore.naver.com",
                Pragma: "no-cache",
                Expires: "0",
                referer: url,
                withCredentials: true,
              },
            }
          )
          simpleProducts.push(...productSATISFACTION.data.simpleProducts)
          resolve()
        } catch(e){
          reject(e)
        }
      }),
    ]
      
    await Promise.all(promiseArr)

    simpleProducts = _.uniqBy(simpleProducts, "id")
    
    for (const item of simpleProducts.filter((item) => {
      // if(item.simpleProduct.category.wholeCategoryId.includes("50000006")){
      // if(

      // item.category.wholeCategoryId.includes("50000006") ||
      // item.category.wholeCategoryId.includes("50000010") ||
      // item.category.wholeCategoryId.includes("50005542") ||
      // item.category.wholeCategoryId.includes("50000009")

      // ){
        return false
      // }
      // console.log("item--", item)
      // if (category.length === 0 || category.includes(item.category.wholeCategoryId.split(">")[0])) {
      //   if (
      //     item.saleAmount.recentSaleCount >= minRecent &&
      //     item.saleAmount.cumulationSaleCount >= totalMinSale &&
      //     item.reviewAmount.totalReviewCount >= minReview
      //   ) {
      //     return true
      //   }
      // }

      // return false
    })) {
      try {
        
        const content = await axios.get(
          `https://smartstore.naver.com/i/v1/stores/${item.channel.channelNo}/products/${item.id}`,
          {
            headers: {
              "User-Agent":
                userAgent,
              "sec-fetch-site": "same-origin",
              "sec-fetch-mode": "cors",
              "Accept-Encoding": "gzip, deflate, br",
              Connection: "keep-alive",
              "Cache-Control": "no-cache",
              Host: "smartstore.naver.com",
              Pragma: "no-cache",
              Expires: "0",
              referer: url,
            },
          }
        )
        
        let regDayPass = false
        let recentPass = false
        let totalPass = false
        let reviewPass = false
        let pricePass = false
        if (regDay === 300) {
          regDayPass = true
        } else {
          const regDate = moment(content.data.regDate).format("YYYYMMDD")
          const recentDate = moment().add(-regDay, "days").format("YYYYMMDD")

          if (recentDate <= regDate) {
            regDayPass = true
          }
        }

        // 최근 3일
        if (minRecent === 0 && maxRecent === 50) {
          recentPass = true
        } else if (minRecent === 0 && maxRecent < 50) {
          if (item.saleAmount.recentSaleCount <= maxRecent) {
            recentPass = true
          }
        } else if (minRecent > 0 && maxRecent === 50) {
          if (item.saleAmount.recentSaleCount >= minRecent) {
            recentPass = true
          }
        } else {
          if (
            item.saleAmount.recentSaleCount >= minRecent &&
            item.saleAmount.recentSaleCount <= maxRecent
          ) {
            recentPass = true
          }
        }

        // 최근 6개월
        if (totalMinSale === 0 && totalMaxSale === 100) {
          totalPass = true
        } else if (totalMinSale === 0 && totalMaxSale < 100) {
          if (item.saleAmount.cumulationSaleCount <= totalMaxSale) {
            totalPass = true
          }
        } else if (totalMinSale > 0 && totalMaxSale === 100) {
          if (item.saleAmount.cumulationSaleCount >= totalMinSale) {
            totalPass = true
          }
        } else {
          if (
            item.saleAmount.cumulationSaleCount >= totalMinSale &&
            item.saleAmount.cumulationSaleCount <= totalMaxSale
          ) {
            totalPass = true
          }
        }

        // 리뷰
        if (minReview === 0 && maxReview === 1000) {
          reviewPass = true
        } else if (minReview === 0 && maxReview < 1000) {
          if (item.reviewAmount.totalReviewCount <= maxReview) {
            reviewPass = true
          }
        } else if (minReview > 0 && maxReview === 1000) {
          if (item.reviewAmount.totalReviewCount >= minReview) {
            reviewPass = true
          }
        } else {
          if (
            item.reviewAmount.totalReviewCount >= minReview &&
            item.reviewAmount.totalReviewCount <= maxReview
          ) {
            reviewPass = true
          }
        }

        let salePrice = content.data.salePrice
        if (content.data.benefitsView && content.data.benefitsView.discountedSalePrice) {
          salePrice = content.data.benefitsView.discountedSalePrice
        }
        // 판매가격
        if (minPrice === 0 && maxPrice === 2000000) {
          pricePass = true
        } else if (minPrice === 0 && maxPrice < 2000000) {
          if (salePrice <= maxPrice) {
            pricePass = true
          }
        } else if (minPrice > 0 && maxPrice === 2000000) {
          if (salePrice >= minPrice) {
            pricePass = true
          }
        } else {
          if (salePrice >= minPrice && salePrice <= maxPrice) {
            pricePass = true
          }
        }

        // 0200036 일본
        // console.log("egDayPass, recentPass, totalPass, reviewPass, pricePass", regDayPass, recentPass, totalPass, reviewPass, pricePass)
        // console.log("content.data.originAreaInfo.originAreaCode", content.data.originAreaInfo.originAreaCode)
        // console.log("content.data.originAreaInfo.content", content.data.originAreaInfo.content)
        if (
          regDayPass &&
          recentPass &&
          totalPass &&
          reviewPass &&
          pricePass &&
          content.data &&
          content.data.claimDeliveryInfo &&
          content.data.claimDeliveryInfo.overseasShipping === true &&
          // (content.data.originAreaInfo.originAreaCode === "0200037" ||
          //   content.data.originAreaInfo.content.includes("중국") ||
          //   content.data.originAreaInfo.originAreaCode === "0200036" ||
          //   content.data.originAreaInfo.content.includes("일본")) &&
          (!content.data.naverShoppingSearchInfo || !content.data.naverShoppingSearchInfo.brandId)
        ) {
          let sellerTags = []

          if (item.seoInfo && item.seoInfo.sellerTags) {
            sellerTags = item.seoInfo.sellerTags.map((item) => {
              return item.text
            })
          } else if (content.data.seoInfo && content.data.seoInfo.sellerTags) {
            sellerTags = content.data.seoInfo.sellerTags.map((item) => {
              return item.text
            })
          }

          let category1,
            category2,
            category3,
            category4 = null
          const wholeCategoryId = item.category.wholeCategoryId.split(">")
          if (wholeCategoryId.length > 0) {
            category1 = wholeCategoryId[0]
          }
          if (wholeCategoryId.length > 1) {
            category2 = wholeCategoryId[1]
          }
          if (wholeCategoryId.length > 2) {
            category3 = wholeCategoryId[2]
          }
          if (wholeCategoryId.length > 3) {
            category4 = wholeCategoryId[3]
          }

          list.push({
            type: "ranking",
            displayName: channel.channelName,
            productNo: item.productNo,
            detailUrl: `${url}/products/${item.id}`,
            name: item.name
              ? item.name
                  .replace(item.channel.channelName, "")
                  .replace("(", "")
                  .replace(")", "")
                  .replace("[", "")
                  .replace("]", "")
                  .replace("/", " ")
                  .trim()
              : "",
            categoryId: item.category.categoryId,
            category1,
            category2,
            category3,
            category4,
            salePrice: salePrice,
            regDate: content.data.regDate,
            // category: item.simpleProduct.category,
            image: item.representativeImageUrl,
            // saleAmount: item.simpleProduct.saleAmount,
            sellerTags,
            reviewCount: item.reviewAmount.totalReviewCount,
            zzim: 0,
            purchaseCnt: item.saleAmount.cumulationSaleCount,
            recentSaleCount: item.saleAmount.recentSaleCount,
            originArea: content.data.originAreaInfo.content.includes("중국")
              ? "중국"
              : content.data.originAreaInfo.content.includes("일본")
              ? "일본"
              : content.data.originAreaInfo.content,
          })
        }

        // const originAreaInfo = jsObj.product.A.originAreaInfo
        // // console.log("originAreaInfo", originAreaInfo)

        // if(originAreaInfo.originAreaType !== "LOCAL" &&
        //   ( originAreaInfo.content.includes("중국") ||
        //     originAreaInfo.content.includes("china") ||
        //     originAreaInfo.content.includes("상세") )
        //    ) {

        //   let sellerTags = []
        //   if(item.seoInfo && item.seoInfo.sellerTags){

        //     sellerTags = item.seoInfo.sellerTags.map(item => {
        //       return item.text
        //     })
        //   }
        //   list.push({
        //     type: "ranking",
        //     displayName: channel.channelName,
        //     productNo: item.productNo,
        //     detailUrl: `${url}/products/${item.id}`,
        //     name: item.name ? item.name.replace(item.channel.channelName, "")
        //     .replace("(", "")
        //     .replace(")", "")
        //     .replace("[", "")
        //     .replace("]", "")
        //     .replace("/", " ")
        //     .trim() : ""
        //     ,
        //     categoryId:item.category.categoryId,
        //     // category: item.simpleProduct.category,
        //     image: item.representativeImageUrl,
        //     // saleAmount: item.simpleProduct.saleAmount,
        //     sellerTags,
        //     reviewCount: item.reviewAmount.totalReviewCount,
        //     zzim: 0,
        //     purchaseCnt: item.saleAmount.cumulationSaleCount,
        //     recentSaleCount: item.saleAmount.recentSaleCount,
        //   })
        // }
      } catch (e) {
        console.log("eee1", e)
      }
    }

      
    
    // console.log("list", list)
  } catch (err) {
    console.log("Error", err.message)
    return list
  } finally {

    return list
  }
}

module.exports = find