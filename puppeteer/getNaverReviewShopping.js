const axios = require("axios");
const fakeUa = require("fake-useragent");
const moment = require("moment");
const _ = require("lodash");
const smartStoreCategory = require("../models/smartStoreCategory");
const { NaverKeywordRel } = require("../api/Naver");
const { sleep, getSbth } = require("../lib/userFunc");
const find = async ({ channelID, url }) => {
  const userAgent = fakeUa();

  const productList = [];
  const japanProduct = [];
  try {
    const popularContent = await axios.get(
      `https://smartstore.naver.com/i/v1/stores/${channelID}/categories/ALL/products?categoryId=ALL&categorySearchType=STDCATG&sortType=POPULAR&page=1&pageSize=80`,
      {
        headers: {
          "User-Agent": userAgent,
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
    );
    for (const item of popularContent.data.simpleProducts) {
      if (!_.find(productList, { id: item.id })) {
        productList.push(item);
      }
    }
    await sleep(300);
    const totalSaleContent = await axios.get(
      `https://smartstore.naver.com/i/v1/stores/${channelID}/categories/ALL/products?categoryId=ALL&categorySearchType=STDCATG&sortType=TOTALSALE&page=1&pageSize=80`,
      {
        headers: {
          "User-Agent": userAgent,
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
    );
    for (const item of totalSaleContent.data.simpleProducts) {
      if (!_.find(productList, { id: item.id })) {
        productList.push(item);
      }
    }
    await sleep(300);
    const reviewContent = await axios.get(
      `https://smartstore.naver.com/i/v1/stores/${channelID}/categories/ALL/products?categoryId=ALL&categorySearchType=STDCATG&sortType=REVIEW&page=1&pageSize=80`,
      {
        headers: {
          "User-Agent": userAgent,
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
    );
    for (const item of reviewContent.data.simpleProducts) {
      if (!_.find(productList, { id: item.id })) {
        productList.push(item);
      }
    }

    // for (const item of reviewContent.data.simpleProducts.filter(
    //   (item) => item.reviewAmount.totalReviewCount > 1
    // )) {
    //   // console.log("item--", item);
    //   productList.push(item);
    // }
  } catch (e) {}

  // console.log("productList", productList);
  for (const item of productList) {
    try {
      const zzimResponse = await axios.get(
        `https://smartstore.naver.com/i/v1/keeps/products/${item.id}`,
        {
          headers: {
            "User-Agent": userAgent,
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
      );

      let zzim = zzimResponse.data[item.id].count;
      item.zzim = zzim;
      // console.log("zzimResponse----", zzimResponse.data[item.id].count);
      const content = await axios.get(
        `https://smartstore.naver.com/i/v1/stores/${channelID}/products/${item.id}`,
        {
          headers: {
            "User-Agent": userAgent,
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
      );
      let price = 0;
      let deliveryFee = 0;
      const product = content.data;
      if (
        product &&
        product.originAreaInfo &&
        product.originAreaInfo.content.includes("일본")
      ) {
        // console.log("channelID, ", item);
        // console.log("item----->", product);
        let isFind = false;
        let titleArr = product.name.split(" ");
        let keyword = titleArr.join(" ");
        let shoppingList = null;
        while (!isFind) {
          await sleep(1000);
          console.log("product.name", product.name);
          shoppingList = await axios.get(
            `https://search.shopping.naver.com/api/search/all?eq=&frm=NVSHOVS&iq=&&pagingIndex=1&pagingSize=80&productSet=overseas&query=${encodeURI(
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

          if (shoppingList.data.shoppingResult.products) {
            const findProduct = _.find(
              shoppingList.data.shoppingResult.products,
              {
                chnlSeq: channelID.toString(),
                mallProductId: item.id.toString(),
              }
            );

            if (findProduct) {
              isFind = true;
              item.openDate = findProduct.openDate;
              item.purchaseCnt = findProduct.purchaseCnt;
            } else {
              item.purchaseCnt = 0;
            }
          }

          if (!shoppingList.data.shoppingResult.products || !isFind) {
            titleArr = titleArr.splice(titleArr.length - 1, 1);
            keyword = titleArr.join(" ");
            if (titleArr.length === 1) {
              console.log(
                "못찾음",
                item.channel.channelName,
                " - ",
                product.name
              );
              isFind = true;
            }
          }
        }

        if (
          item.purchaseCnt > 0 ||
          item.zzim > 0 ||
          item.reviewAmount.totalReviewCount > 0
        ) {
          // 구매, 찜, 리뷰 있으면....
          price = product.discountedSalePrice;
          deliveryFee =
            product && product.productDeliveryInfo
              ? product.productDeliveryInfo.baseFee
              : 0;
          item.deliveryFee = deliveryFee;
          // console.log("price, deliveryFee", price, deliveryFee);
          if (
            product.optionCombinations &&
            Array.isArray(product.optionCombinations)
          ) {
            for (const option of product.optionCombinations) {
              option.totalPrice = price + option.price + deliveryFee;
            }

            const maxOption = _.maxBy(product.optionCombinations, "totalPrice");
            const minOption = _.minBy(product.optionCombinations, "totalPrice");

            item.maxOption = maxOption;
            item.minOption = minOption;
            item.maxPrice = maxOption
              ? maxOption.totalPrice
              : price + deliveryFee;
            item.minPrice = minOption
              ? minOption.totalPrice
              : price + deliveryFee;
          } else {
            item.maxPrice = price + deliveryFee;
            item.minPrice = price + deliveryFee;
          }
          item.sellerTags = product.sellerTags;
          item.originArea = product.originAreaInfo.content;
          item.categoryId = product.category.categoryId;
          item.category1Id = product.category.category1Id;
          item.category2Id = product.category.category2Id;
          item.category3Id = product.category.category3Id;
          item.category4Id = product.category.category4Id;
          item.productUrl = product.productUrl;

          const category = _.find(smartStoreCategory, {
            카테고리코드: item.categoryId,
          });
          let categoryName = "";
          if (category) {
            if (category.대분류) {
              categoryName = category.대분류;
            }
            if (category.중분류) {
              categoryName += ` > ${category.중분류}`;
            }
            if (category.소분류) {
              categoryName += ` > ${category.소분류}`;
            }
            if (category.세분류) {
              categoryName += ` > ${category.세분류}`;
            }
          }
          item.categoryName = categoryName;
          item.manufacturerName =
            product.naverShoppingSearchInfo &&
            product.naverShoppingSearchInfo.manufacturerName
              ? product.naverShoppingSearchInfo.manufacturerName
              : null;
          item.brandName =
            product.naverShoppingSearchInfo &&
            product.naverShoppingSearchInfo.brandName
              ? product.naverShoppingSearchInfo.brandName
              : null;
          item.brandId =
            product.naverShoppingSearchInfo &&
            product.naverShoppingSearchInfo.brandId
              ? product.naverShoppingSearchInfo.brandId
              : null;
          item.modelName =
            product.naverShoppingSearchInfo &&
            product.naverShoppingSearchInfo.modelName
              ? product.naverShoppingSearchInfo.modelName
              : null;

          item.productAttributes = product.productAttributes;

          if (item.brandName) {
            let isLoading = true;
            let i = 0;
            while (isLoading) {
              try {
                const response = await NaverKeywordRel({
                  keyword: item.brandName,
                });

                if (response && response.keywordList) {
                  isLoading = false;
                  let monthlyCnt = 0;
                  const findObj = _.find(response.keywordList, {
                    relKeyword: item.brandName,
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
                  item.monthlyCnt = monthlyCnt;
                } else {
                  console.log("브랜드--", item.brandName);
                  await sleep(500);
                  if (i++ > 10) {
                    isLoading = false;
                  }
                }
              } catch (e) {
                console.log("무슨 에러? ", e);
                isLoading = false;
              }
            }
          }

          japanProduct.push(item);
        }

        // console.log("content.data=>", product.optionCombinations);
      }
    } catch (e) {
      console.log("무슨 에러", e);
    }
  }

  return japanProduct.map((item) => {
    return {
      productNo: item.id.toString(),
      displayName: item.channel.channelName,
      detailUrl: item.productUrl,
      name: item.name,
      categoryId: item.categoryId,
      category1: item.category1Id,
      category2: item.category2Id,
      category3: item.category3Id,
      category4: item.category4Id,
      categoryName: item.categoryName,
      maxPrice: item.maxPrice,
      minPrice: item.minPrice,
      image: item.representativeImageUrl,
      sellerTags: item.sellerTags,
      productAttributes: item.productAttributes,
      manufacturerName: item.manufacturerName,
      brandName: item.brandName,
      brandId: item.brandId,
      modelName: item.modelName,
      reviewCount: item.reviewAmount.totalReviewCount,
      zzim: item.zzim,
      purchaseCnt: item.purchaseCnt,
      openDate: item.openDate,
      originArea: item.originArea,
      monthlyCnt: item.monthlyCnt,
    };
  });
};

module.exports = find;
