const axios = require("axios");
const fakeUa = require("fake-useragent");
const moment = require("moment");
const _ = require("lodash");
const NaverBestItem = require("../models/NaverBestItem");
const NaverMall = require("../models/naverMall");

const find = async ({
  channelID,
  _id,
  url,
  category = "",
  regDay,
  minRecent,
  maxRecent,
  totalMinSale,
  totalMaxSale,
  minReview,
  maxReview,
  minPrice,
  maxPrice,
  isJapan,
  brandUrl,
}) => {
  try {
    const userAgent = fakeUa();
    console.log("brandUrl", brandUrl);
    const bestcontent = await axios.get(
      // `https://smartstore.naver.com/i/v1/smart-stores/${channelID}/best-products`,
      `https://smartstore.naver.com/i/v1/smart-stores?url=${brandUrl}`,

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

    if (bestcontent && bestcontent.data && bestcontent.data.specialProducts) {
      if (
        bestcontent.data.specialProducts &&
        bestcontent.data.specialProducts.bestProductNos &&
        Array.isArray(bestcontent.data.specialProducts.bestProductNos)
      ) {
        for (const item of bestcontent.data.specialProducts.bestProductNos) {
          try {
            const content = await axios.get(
              `https://smartstore.naver.com/i/v1/stores/${channelID}/products/${item}`,
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

            if (
              content &&
              content.data &&
              content.data.claimDeliveryInfo &&
              content.data.claimDeliveryInfo.overseasShipping === true &&
              // (content.data.originAreaInfo.originAreaCode === "0200037" ||
              //   content.data.originAreaInfo.content.includes("중국") ||
              //   content.data.originAreaInfo.originAreaCode === "0200036" ||
              //   content.data.originAreaInfo.content.includes("일본")) &&
              (!content.data.naverShoppingSearchInfo ||
                !content.data.naverShoppingSearchInfo.brandId)
            ) {
              let sellerTags = [];

              if (content.data.seoInfo && content.data.seoInfo.sellerTags) {
                sellerTags = content.data.seoInfo.sellerTags.map((item) => {
                  return item.text;
                });
              }

              const category1 = content.data.category.category1Id;
              const category2 = content.data.category.category2Id;
              const category3 = content.data.category.category3Id;
              const category4 = content.data.category.category4Id;
              const categoryId = content.data.category.categoryId;

              const name = content.data.name
                ? content.data.name
                    .replace(content.data.channel.channelName, "")
                    .replace("(", "")
                    .replace(")", "")
                    .replace("[", "")
                    .replace("]", "")
                    .replace("/", " ")
                    .trim()
                : "";

              const originArea = content.data.originAreaInfo.content.includes(
                "중국"
              )
                ? "중국"
                : content.data.originAreaInfo.content.includes("일본")
                ? "일본"
                : content.data.originAreaInfo.content;

              // if(originArea !== "일본") {
              if (originArea.includes("일본")) {
                if (isJapan) {
                  if (isJapan) {
                    await NaverBestItem.findOneAndUpdate(
                      {
                        productNo: content.data.id,
                      },
                      {
                        $set: {
                          type: "best",
                          productNo: content.data.id,
                          displayName: content.data.channel.channelName,
                          productNo: content.data.id,
                          detailUrl: content.data.productUrl,
                          name,
                          title: name.replace(/ /gi, ""),
                          categoryId,
                          category1,
                          category2,
                          category3,
                          category4,
                          salePrice: content.data.salePrice,
                          image: content.data.productImages[0].url,

                          sellerTags,
                          reviewCount:
                            content.data.reviewAmount.totalReviewCount,
                          originArea,
                        },
                      },
                      {
                        upsert: true,
                        new: true,
                      }
                    );
                  }
                }
              } else {
                await NaverBestItem.findOneAndUpdate(
                  {
                    productNo: content.data.id,
                  },
                  {
                    $set: {
                      type: "best",
                      productNo: content.data.id,
                      displayName: content.data.channel.channelName,
                      productNo: content.data.id,
                      detailUrl: content.data.productUrl,
                      name,
                      title: name.replace(/ /gi, ""),
                      categoryId,
                      category1,
                      category2,
                      category3,
                      category4,
                      salePrice: content.data.salePrice,
                      image: content.data.productImages[0].url,

                      sellerTags,
                      reviewCount: content.data.reviewAmount.totalReviewCount,
                      originArea,
                    },
                  },
                  {
                    upsert: true,
                    new: true,
                  }
                );
              }

              // }
            }
          } catch (e) {
            console.log("FOR__", e);
          }
        }
      }
    }
  } catch (e) {
    console.log("eee1", e.response.data);
  }
};

module.exports = find;
