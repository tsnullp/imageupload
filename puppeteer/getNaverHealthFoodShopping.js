const axios = require("axios")
const moment = require("moment")
const healthfoodcategory = require("../models/healthfoodcategory"
)
const find = async ({ url, category = "", regDay, minRecent, maxRecent, totalMinSale, totalMaxSale, minReview, maxReview, minPrice, maxPrice }) => {
  const list = []
  try {
    
    const content = await axios.get(url)

      const temp1 = content.data.split("window.__PRELOADED_STATE__=")[1]
      const temp2 = temp1.split("<span")[0].trim()
      const temp21 = temp2.split("</script>")[0].trim()
      
      const jsObj = JSON.parse(temp21)
      
 
      const {data} = jsObj.widgetContents.wholeProductWidget.A

      const {channel} = jsObj.smartStoreV2

      const rankingProducts = jsObj.widgetContents.wholeProductWidget.A.data  || []
    // console.log("rankingProducts", rankingProducts.length)
      for(const item of rankingProducts.filter(item => {
      
        if(healthfoodcategory.filter(health => health.카테고리코드.toString() === item.category.categoryId).length === 0){
          return false
        }
        
        // if(item.simpleProduct.category.wholeCategoryId.includes("50000006")){
        // if(
           
        // item.category.wholeCategoryId.includes("50000006") ||
        // item.category.wholeCategoryId.includes("50000010") ||
        // item.category.wholeCategoryId.includes("50005542") ||
        // item.category.wholeCategoryId.includes("50000009")
        
        // ){
        //   return false
        // }
        
        if(category.length === 0 || category.includes(item.category.wholeCategoryId.split(">")[0])){
          if(item.saleAmount.recentSaleCount >= minRecent && item.saleAmount.cumulationSaleCount >= totalMinSale &&
            item.reviewAmount.totalReviewCount >= minReview
            ){
            return true
          }
        }
       
        return false
      })
     
      ){
        
        try {
          
          const content = await axios.get(`https://smartstore.naver.com/i/v1/stores/${item.channel.channelNo}/products/${item.id}`)
        
          let regDayPass = false
          let recentPass = false
          let totalPass = false
          let reviewPass = false
          let pricePass = false
          if(regDay === 300){
            regDayPass = true
          } else {
            const regDate = moment(content.data.regDate).format("YYYYMMDD")
            const recentDate = moment().add(-regDay, "days").format("YYYYMMDD")

            if(recentDate <= regDate){
              regDayPass = true
            }
          }
          

          // 최근 3일
          if(minRecent === 0 && maxRecent === 50){
            recentPass = true
          } else if(minRecent === 0 && maxRecent < 50){
            if(item.saleAmount.recentSaleCount <= maxRecent){
              recentPass = true
            }
          } else if(minRecent > 0 && maxRecent === 50){
            if(item.saleAmount.recentSaleCount >= minRecent){
              recentPass = true
            }
          } else {
            if(item.saleAmount.recentSaleCount >= minRecent && item.saleAmount.recentSaleCount <= maxRecent){              
              recentPass = true
            }
          }

          // 최근 6개월
          if(totalMinSale === 0 && totalMaxSale === 100){
            totalPass = true
          } else if(totalMinSale === 0 && totalMaxSale < 100){
            if(item.saleAmount.cumulationSaleCount <= totalMaxSale){
              totalPass = true
            }
          } else if(totalMinSale > 0 && totalMaxSale === 100){
            if(item.saleAmount.cumulationSaleCount >= totalMinSale){
              totalPass = true
            }
          } else {
            if(item.saleAmount.cumulationSaleCount >= totalMinSale && item.saleAmount.cumulationSaleCount <= totalMaxSale){
              totalPass = true
            }
          }


          // 리뷰
          if(minReview === 0 && maxReview === 1000){
            reviewPass = true
          } else if(minReview === 0 && maxReview < 1000){
            if(item.reviewAmount.totalReviewCount <= maxReview){
              reviewPass = true
            }
          } else if(minReview > 0 && maxReview === 1000){
            if(item.reviewAmount.totalReviewCount >= minReview){
              reviewPass = true
            }
          } else {
            if(item.reviewAmount.totalReviewCount >= minReview && item.reviewAmount.totalReviewCount <= maxReview){              
              reviewPass = true
            }
          }

          let salePrice = content.data.salePrice
          if(content.data.benefitsView && content.data.benefitsView.discountedSalePrice){
            salePrice = content.data.benefitsView.discountedSalePrice
          }
          // 판매가격
          if(minPrice === 0 && maxPrice === 2000000){
            pricePass = true
          } else if(minPrice === 0 && maxPrice < 2000000){
            if(salePrice <= maxPrice){
              pricePass = true
            }
          } else if(minPrice > 0 && maxPrice === 2000000){
            if(salePrice >= minPrice){
              pricePass = true
            }
          } else {
            if(salePrice >= minPrice && salePrice <= maxPrice){              
              pricePass = true
            }
          }
          // console.log("egDayPass, recentPass, totalPass, reviewPass, pricePass", regDayPass, recentPass, totalPass, reviewPass, pricePass)
          if( regDayPass && recentPass && totalPass && reviewPass && pricePass && content.data && content.data.claimDeliveryInfo && 
            content.data.claimDeliveryInfo.overseasShipping === true &&
            (content.data.originAreaInfo.originAreaCode === "0204000" || content.data.originAreaInfo.originAreaCode === "03" && content.data.originAreaInfo.content.includes("미국"))
          ){

            let sellerTags = []
          
            if(item.seoInfo && item.seoInfo.sellerTags){
              
              sellerTags = item.seoInfo.sellerTags.map(item => {
                return item.text
              })
            } else if(content.data.seoInfo && content.data.seoInfo.sellerTags) {
              sellerTags = content.data.seoInfo.sellerTags.map(item => {
                return item.text
              })
            }
            
            let category1, category2, category3, category4 = null
            const wholeCategoryId = item.category.wholeCategoryId.split(">")
            if(wholeCategoryId.length > 0){
              category1 = wholeCategoryId[0]
            }
            if(wholeCategoryId.length > 1){
              category2 = wholeCategoryId[1]
            }
            if(wholeCategoryId.length > 2){
              category3 = wholeCategoryId[2]
            }
            if(wholeCategoryId.length > 3){
              category4 = wholeCategoryId[3]
            }
            
            list.push({
              type: "ranking",
              displayName: channel.channelName,
              productNo: item.productNo,
              detailUrl: `${url}/products/${item.id}`,
              name: item.name ? item.name.replace(item.channel.channelName, "")
              .replace("(", "")
              .replace(")", "")
              .replace("[", "")
              .replace("]", "")
              .replace("/", " ")
              .trim() : ""
              ,
              categoryId:item.category.categoryId,
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
    console.log("Error", err)
    return list
  } finally {

    return list
  }
}

module.exports = find