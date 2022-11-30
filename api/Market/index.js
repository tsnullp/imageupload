const CoupangAPI = require("./CoupangAPI")
const Cafe24API = require("./Cafe24API")
const { encode } = require("node-base64-image")
const axios = require("axios")
const moment = require("moment")
const puppeteer = require("puppeteer")

exports.CategoryPredict = async ({ userID, productName }) => {
  const path = "/v2/providers/openapi/apis/api/v1/categorization/predict"
  return await CoupangAPI({
    userID,
    method: "POST",
    path,
    parameter: {
      productName,
    },
  })
}

exports.CategorySearch = async ({ userID, displayCategoryCode }) => {
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/meta/display-categories/${displayCategoryCode}`
  return await CoupangAPI({
    userID,
    method: "GET",
    path,
    parameter: {},
  })
}

exports.DisplayCategories = async ({ userID }) => {
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/meta/display-categories`
  return await CoupangAPI({
    userID,
    method: "GET",
    path,
    parameter: {},
  })
}

exports.Outbound = async ({ userID }) => {
  const path = `/v2/providers/marketplace_openapi/apis/api/v1/vendor/shipping-place/outbound`
  return await CoupangAPI({
    userID,
    method: "GET",
    path,
    parameter: {},
    query: "pageSize=50&pageNum=1",
  })
}

exports.ReturnShippingCenter = async ({ userID }) => {
  const pathSegment = [`/v2/providers/openapi/apis/api/v4/vendors/`, `/returnShippingCenters`]
  return await CoupangAPI({
    userID,
    method: "GET",
    pathSegment,
    parameter: {},
    query: "pageSize=50&pageNum=1",
  })
}

exports.CategoryMeta = async ({ userID, categoryCode }) => {
  try {
    console.log("categoryCode", categoryCode)
    const path = `/v2/providers/seller_api/apis/api/v1/marketplace/meta/category-related-metas/display-category-codes/${categoryCode}`
    return await CoupangAPI({
      userID,
      method: "GET",
      path,
      parameter: {},
    })
  } catch (e) {
    console.log("CategoryMeta", e)
  }
}

exports.CoupnagCreateProduct = async ({ userID, product }) => {
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products`
  return await CoupangAPI({
    userID,
    method: "POST",
    path,
    parameter: product,
  })
}

exports.CoupnagUpdateProduct = async ({ userID, product }) => {
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products`
  return await CoupangAPI({
    userID,
    method: "PUT",
    path,
    parameter: product,
  })
}

exports.CoupnagGET_PRODUCT_STATUS_HISTORY = async ({ userID, productID }) => {
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products/${productID}/histories`
  return await CoupangAPI({
    userID,
    method: "GET",
    path,
    parameter: {},
  })
}

exports.CoupnagGET_PRODUCT_BY_PRODUCT_ID = async ({ userID, productID }) => {
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products/${productID}`
  return await CoupangAPI({
    userID,
    method: "GET",
    path,
    parameter: {},
  })
}

exports.CoupnagUPDATE_PRODUCT = async ({ userID, product }) => {
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products`
  return await CoupangAPI({
    userID,
    method: "PUT",
    path,
    parameter: product,
  })
}

exports.CoupnagSTOP_PRODUCT_SALES_BY_ITEM = async ({ userID, vendorItemId }) => {
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/vendor-items/${vendorItemId}/sales/stop`
  return await CoupangAPI({
    userID,
    method: "PUT",
    path,
    parameter: {},
  })
}

exports.CoupnagRESUME_PRODUCT_SALES_BY_ITEM = async ({ userID, vendorItemId }) => {
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/vendor-items/${vendorItemId}/sales/resume`
  return await CoupangAPI({
    userID,
    method: "PUT",
    path,
    parameter: {},
  })
}

exports.CoupnagUPDATE_PRODUCT_PRICE_BY_ITEM = async ({ userID, vendorItemId, price }) => {
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/vendor-items/${vendorItemId}/prices/${price}`
  return await CoupangAPI({
    userID,
    method: "PUT",
    path,
    parameter: {},
  })
}

exports.CoupangAPPROVE_PRODUCT = async ({ userID, sellerProductId }) => {
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products/${sellerProductId}/approvals`

  return await CoupangAPI({
    userID,
    method: "PUT",
    path,
    parameter: {},
  })
}
exports.CoupnagUPDATE_PRODUCT_QUANTITY_BY_ITEM = async ({ userID, vendorItemId, quantity }) => {
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/vendor-items/${vendorItemId}/quantities/${quantity}`

  return await CoupangAPI({
    userID,
    method: "PUT",
    path,
    parameter: {},
  })
}
exports.CouapngDeleteProduct = async ({ userID, productID }) => {
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products/${productID}`
  return await CoupangAPI({
    userID,
    method: "DELETE",
    path,
    parameter: {},
  })
}

exports.Cafe24CreateProduct = async ({ mallID, payload }) => {
  const path = `admin/products`
  return await Cafe24API({
    mallID,
    payload,
    method: "POST",
    path,
  })
}

exports.Cafe24UpdateProduct = async ({ mallID, payload, product_no }) => {
  const path = `admin/products/${product_no}`
  return await Cafe24API({
    mallID,
    payload,
    method: "PUT",
    path,
  })
}

exports.Cafe24UploadImages = async ({ mallID, images }) => {
  try {
    const base64Image = []

    const options = {
      string: true,
      headers: {
        "User-Agent": "my-app",
      },
    }

    for (const item of images) {
      const image = await encode(item, options)
      base64Image.push({ image })
    }

    const path = `admin/products/images`
    const payload = {
      requests: base64Image,
    }

    return await Cafe24API({
      mallID,
      payload,
      method: "POST",
      path,
    })
  } catch (e) {
    console.log("Cafe24UploadImages", e)
  }
}

exports.Cafe24ListAllOrigin = async ({ mallID, offset }) => {
  try {
    const path = `admin/origin?limit=100&offset=${offset}`
    return await Cafe24API({
      mallID,

      method: "GET",
      path,
    })
  } catch (e) {
    console.log("Cafe24ListAllOrigin", e)
    return null
  }
}

exports.Cafe24CreateProductsOption = async ({ mallID, product_no, payload }) => {
  try {
    const path = `admin/products/${product_no}/options`

    return await Cafe24API({
      mallID,
      method: "POST",
      path,
      payload,
    })
  } catch (e) {
    console.log("Cafe24CreateProductsOption", e)
    return null
  }
}

exports.Cafe24UpdateProductsOption = async ({ mallID, product_no, payload }) => {
  try {
    const path = `admin/products/${product_no}/options`

    return await Cafe24API({
      mallID,
      method: "PUT",
      path,
      payload,
    })
  } catch (e) {
    console.log("Cafe24CreateProductsOption", e)
    return null
  }
}

exports.Cafe24DeleteProductsOption = async ({ mallID, product_no }) => {
  try {
    const path = `admin/products/${product_no}/options`

    return await Cafe24API({
      mallID,
      method: "DELETE",
      path,
    })
  } catch (e) {
    console.log("Cafe24CreateProductsOption", e)
    return null
  }
}

exports.Cafe24ListProductsVariants = async ({ mallID, product_no }) => {
  try {
    const path = `admin/products/${product_no}/variants`
    return await Cafe24API({
      mallID,

      method: "GET",
      path,
    })
  } catch (e) {
    console.log("Cafe24ListProductsVariants", e)
    return null
  }
}

exports.Cafe24UpdateProductsVariants = async ({ mallID, product_no, payload }) => {
  try {
    const path = `admin/products/${product_no}/variants`
    return await Cafe24API({
      mallID,
      payload,
      method: "PUT",
      path,
    })
  } catch (e) {
    console.log("Cafe24ListProductsVariants", e)
    return null
  }
}

exports.Cafe24DeleteProductsVariants = async ({ mallID, product_no, variant_code }) => {
  try {
    const path = `admin/products/${product_no}/variants/${variant_code}`
    return await Cafe24API({
      mallID,
      method: "DELETE",
      path,
    })
  } catch (e) {
    console.log("Cafe24DeleteProductsVariants", e)
    return null
  }
}

exports.Cafe24DeleteProduct = async ({ mallID, product_no }) => {
  try {
    const path = `admin/products/${product_no}`
    return await Cafe24API({
      mallID,
      method: "DELETE",
      path,
    })
  } catch (e) {
    console.log("Cafe24DeleteProduct", e)
    return null
  }
}

exports.Cafe24CreateCategory = async ({ mallID, payload }) => {
  try {
    const path = `admin/categories`
    return await Cafe24API({
      mallID,
      method: "POST",
      path,
      payload,
    })
  } catch (e) {
    console.log("Cafe24CreateCategory", e)
    return null
  }
}

exports.GetOrderSheet = async ({ userID, vendorId, status }) => {
  const path = `/v2/providers/openapi/apis/api/v4/vendors/${vendorId}/ordersheets`
  const createdAtFrom = moment().add(-30, "days").format("YYYY-MM-DD")
  const createdAtTo = moment().format("YYYY-MM-DD")

  return await CoupangAPI({
    userID,
    method: "GET",
    path,
    parameter: {},
    query: `createdAtFrom=${createdAtFrom}&createdAtTo=${createdAtTo}&status=${status}`,
  })
}

exports.GetOrderID = async ({ userID, vendorId, orderId }) => {
  const path = `/v2/providers/openapi/apis/api/v4/vendors/${vendorId}/${orderId}/ordersheets`

  return await CoupangAPI({
    userID,
    method: "GET",
    path,
    parameter: {},
  })
}

exports.GetProductList = async ({ userID, vendorId, nextToken = 1 }) => {
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products`

  return await CoupangAPI({
    userID,
    method: "GET",
    path,
    parameter: {},
    query: `vendorId=${vendorId}&nextToken=${nextToken}&maxPerPage=100`,
  })
}

exports.GetProductOptions = async ({ userID, sellerProductId }) => {
  try {
    const path = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products/${sellerProductId}`
    return await CoupangAPI({
      userID,
      method: "GET",
      path,
      parameter: {},
    })
  } catch (e) {
    console.log("GetProductOptions", e)
    return null
  }
}

exports.GetOtherSellers = async ({ itemId, vendorItemId }) => {
  try {
    const response = await axios({
      url: `https://www.coupang.com/vp/products/307227331/other-seller-json?itemId=${itemId}&selectedId=${vendorItemId}`,
      method: "GET",
      headers: {
        // 'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        // 'Accept': '*/*',
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
        referer: `https://www.coupang.com/vp/products/307227331?vendorItemId=${itemId}&isAddedCart=`,
      },
      // withCredentials: true,
      // responseType: "arraybuffer"
    })
    // console.log("JSON,, ", response.data)

    return response.data
    // return JSON.parse(response.data.toString())
  } catch (e) {
    console.log("GetOtherSellers", e)
    return null
  }
}

exports.CoupangStoreProductList = async ({ vendorId, sortType = "BEST_SELLING" }) => {
  const browser = await await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  try {
    await page.setJavaScriptEnabled(true)
    console.log(
      "url",
      `https://store.coupang.com/vp/vendors/${vendorId}/product/lists?&sortTypeValue=${sortType}`
    )
    await page.goto(
      `https://store.coupang.com/vp/vendors/${vendorId}/product/lists?&sortTypeValue=${sortType}`,
      {
        waituntil: "networkidle0",
      }
    )

    const content = await page.content()
    console.log("content", content)
    const temp1 = content.split(`pre-wrap;">`)[1]
    const temp2 = temp1.split(`</pre>`)[0]
    const temp3 = JSON.parse(temp2)
    return temp3
  } catch (e) {
    console.log("CoupangStoreProductList", e)
    return null
  } finally {
    if (page) {
      await page.goto("about:blank")
      await page.close()
    }
    if (browser) {
      await browser.close()
    }
  }
}

exports.CoupangDetailProductQuantityInfo = async ({ productId, vendorItemId }) => {
  const browser = await await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  try {
    await page.setJavaScriptEnabled(true)

    await page.goto(
      `https://www.coupang.com/vp/products/${productId}/vendoritems/${vendorItemId}`,
      {
        waituntil: "networkidle0",
      }
    )

    const content = await page.content()

    // console.log("CoupangDetailProductQuantityInfo", content)

    const temp1 = content.split(`pre-wrap;">`)[1]
    const temp2 = temp1.split(`</pre>`)[0]
    const temp3 = JSON.parse(temp2)
    console.log("temp3", temp3)
    return temp3
    // const response = await axios({
    //   url: `https://www.coupang.com/vp/products/${productId}/vendoritems/${vendorItemId}`,
    //   method: "GET",
    //   responseType: "arraybuffer",
    //   headers: {
    //     Cookie:
    //       "sid=8c03654b6281467eb0a758d4e1ce3ebedd5cd791; PCID=37359898937841553505091; MARKETID=37359898937841553505091; overrideAbTestGroup=%5B%5D; _abck=23CEFD122CF9EE4A6C9A7C1CF42F036B~-1~YAAQTdojF0zJk52AAQAAkLap4Aem38mJyCDRuDeiWQemc64uPV++qqbiIdJhz9IW9JSfqSPSS2yTVUKJTl009C63C9u6UwuFh9cluYXG5f/TFBnLSqa+a28uLOSFgmfE5zynppBe8GjhquZAwlp96ts7cdor3u6pOjIB7Wt0tbgWX6cou7TREPKnishkSUMJ28+DATPXvDlNWI4xai0yxn4BQpxCx8feOJ56733QJ/1c2Mzp4P2nCjz9dPh2m8Sg8/lN+4Fm14Hj4hCx2nON275GJS+hW40RCDI8FpgGBq1J+QjGQGioUy43KMKyz3LnCKKOn3ISZCbZoERhc1iJ2f+Y29hLU6wA07OIC465S0mVYIEna+W7h3898EIX97aZ3/VZFpcRwc1yl4uXkimKT8I66zm/s0E/DPg=~-1~-1~-1; ak_bmsc=2E7552B0999029888F6F591343CF9A14~000000000000000000000000000000~YAAQTdojF03Jk52AAQAAkLap4A8oPA/AhX1v4ManbDYdJM46Sp/c2Q7IywRPdSIlfD/iBQNu+oxRaGRkaLwYczENCabTVTuRUnLfjjYnjH2EVE4Zly1c4rD7jcfVe/1YCJyiBGI/gHNih/NSJ94sfvbX1SsYlMUpJOimJUCvN25wLo6lXe2UePdAf7Sdp2M4F/Ado4fy+yS6DZ93tBrxsL35/mMRIGfDkZnXvuCCMGhRfohUbywdmm7qPL93W2xapJALuoh+RMZQka3bm20s0wwQCLZqdLC2WCVpzFbsubhMt5/gq7XWhC3ImosnyAWdFK94LwD7m8sh8tpX0qa1Ba4pjSmnjog9XZsLXpksjgTgkyBox4jXstcQ; bm_sz=6EE208160CAB480847E05C70CA1E4F87~YAAQTdojF07Jk52AAQAAkLap4A/mZNNtC00nZyaDkQyAM8cgpRBKgltgQnmiDDioZO324aWLcSws/7hZUzBeYKF1ezWzPF+ZbmZE+Www1c3J+lHzHFYAoT7GSDM2OGTFYrRjU0YLulZRNXak3qKc47a3QSSwsBv+CxejNHizLdv6miqpW2SeuZPiRXc9ZSFDXaL4cEPsqQuPLHHZPCZUzs2QPZKtNkxSpEJ0F9ULd6em0ex81TRdFZHA9zRi6z3n11Ex/Wj8F65ZbSN4dA3nN5zP6T8P+tkZLe0MnsZH0Ovjg2P3~3556662~4277814",
    //   },
    // })
    // return JSON.parse(response.data.toString())
  } catch (e) {
    console.log("CoupangStoreProductList", e)
    return null
  } finally {
    if (page) {
      await page.goto("about:blank")
      await page.close()
    }
    if (browser) {
      await browser.close()
    }
  }
}

exports.CoupangSdp = async ({ url }) => {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "arraybuffer",
      headers: {
        // 'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        // 'Accept': '*/*',
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
      },
      // withCredentials: true
    })

    const tempStr = response.data.toString().split("xports.sdp = ")[1].split(";")[0]
    return JSON.parse(tempStr)
  } catch (e) {
    console.log("CoupangSdp", url, e.message)
    return null
  }
}

exports.UpdateProductPriceByItem = async ({ userID, vendorItemId, price }) => {
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/vendor-items/${vendorItemId}/prices/${price}`
  return await CoupangAPI({
    userID,
    method: "PUT",
    path,
    parameter: {},
  })
}

exports.Cafe24CountAllProducts = async ({ mallID }) => {
  const path = `admin/products/count`
  return await Cafe24API({
    mallID,
    method: "GET",
    path,
  })
}

exports.Cafe24ListAllProducts = async ({ mallID, limit = 100, offset = 0 }) => {
  const path = `admin/products?limit=${limit}&offset=${offset}`
  return await Cafe24API({
    mallID,
    method: "GET",
    path,
  })
}

exports.Cafe24CountAllOrders = async ({ mallID, orderState = "", startDate, endDate }) => {
  try {
    let order_state = ""
    switch (orderState) {
      case "상품준비":
        order_state = "N10,N20"
        break
      case "배송지시":
        order_state = "N21,N22"
        break
      case "배송중":
        order_state = "N30"
        break
      case "배송완료":
        order_state = "N40"
        break
      case "준비지시중":
        order_state = "N10,N20,N21,N22,N30"
        break
      default:
        break
    }

    let path = ""
    if (order_state.length > 0) {
      path = `admin/orders/count?shop_no=1&start_date=${startDate}&end_date=${endDate}&order_status=${order_state}&date_type=pay_date`
    } else {
      path = `admin/orders/count?shop_no=1&start_date=${startDate}&end_date=${endDate}&date_type=pay_date`
    }

    return await Cafe24API({
      mallID,
      method: "GET",
      path,
    })
  } catch (e) {
    console.log("Cafe24CountAllOrders", e)
    return null
  }
}
exports.Cafe24ListOrders = async ({ mallID, orderState, startDate, endDate }) => {
  try {
    const limit = 500
    const countResponse = await this.Cafe24CountAllOrders({
      mallID,
      orderState,
      startDate,
      endDate,
    })
    console.log("countResponse", countResponse)
    const count = countResponse.data.count
    const page = Math.ceil(count / limit)

    const pageArray = []
    for (let i = 0; i < page; i++) {
      pageArray.push(i)
    }

    let order_state = "N10,N20"
    switch (orderState) {
      case "상품준비":
        order_state = "N10,N20"
        break
      case "배송지시":
        order_state = "N21,N22"
        break
      case "배송중":
        order_state = "N30"
        break
      case "배송완료":
        order_state = "N40"
        break
      case "준비지시중":
        order_state = "N10,N20,N21,N22,N30"
        break
      default:
        order_state = ""
        break
    }
    const list = []
    for (const item of pageArray) {
      let path
      if (order_state.length > 0) {
        path = `admin/orders?order_status=${order_state}&date_type=pay_date&start_date=${startDate}&end_date=${endDate}&limit=${limit}&offset=${
          item * limit
        }&embed=items,receivers,buyer`
      } else {
        path = `admin/orders?date_type=pay_date&start_date=${startDate}&end_date=${endDate}&limit=${limit}&offset=${
          item * limit
        }&embed=items,receivers,buyer`
      }

      const response = await Cafe24API({
        mallID,
        method: "GET",
        path,
      })
      if (response.message === null) {
        list.push(...response.data.orders)
      }
    }

    return list
  } catch (e) {
    console.log("Cafe24ListAllOrigin", e)
    return []
  }
}

exports.Cafe24ListAllOrders = async ({ mallID, startDate, endDate }) => {
  try {
    const limit = 500
    const countResponse = await this.Cafe24CountAllOrders({ mallID, startDate, endDate })

    const count = countResponse.data.count
    const page = Math.ceil(count / limit)

    const pageArray = []
    for (let i = 0; i < page; i++) {
      pageArray.push(i)
    }

    const list = []
    for (const item of pageArray) {
      const path = `admin/orders?date_type=pay_date&start_date=${startDate}&end_date=${endDate}&limit=${limit}&offset=${
        item * limit
      }&embed=items,receivers,buyer`
      const response = await Cafe24API({
        mallID,
        method: "GET",
        path,
      })

      if (response.message === null) {
        list.push(...response.data.orders)
      }
    }

    return list
  } catch (e) {
    console.log("Cafe24ListAllOrigin", e)
    return []
  }
}

exports.Cafe24RegisterShipments = async ({
  mallID,
  order_id,
  tracking_no,
  shipping_company_code = "0006",
  order_item_code,
  shipping_code,
}) => {
  try {
    const path = `admin/orders/${order_id}/shipments`
    return await Cafe24API({
      mallID,
      method: "POST",
      path,
      payload: {
        shop_no: 1,
        request: {
          order_id,
          tracking_no,
          shipping_company_code,
          status: "standby",
          order_item_code,
          shipping_code,
        },
      },
    })
  } catch (e) {
    console.log("Cafe24CountAllOrders", e)
    return null
  }
}

exports.Cafe24UpdateShipments = async ({ mallID, input }) => {
  try {
    const path = `admin/shipments`
    return await Cafe24API({
      mallID,
      method: "PUT",
      path,
      payload: {
        shop_no: 1,
        requests: input.map((item) => {
          return {
            shipping_code: item.shipping_code,
            order_id: item.order_id,
            status: "shipping",
          }
        }),
      },
    })
  } catch (e) {
    console.log("Cafe24CountAllOrders", e)
    return null
  }
}

exports.Cafe24UploadLocalImage = async ({ base64Image }) => {
  try {
    const path = `admin/products/images`
    const payload = {
      requests: [
        {
          image: base64Image,
        },
      ],
    }

    return await Cafe24API({
      mallID: "tsnullp",
      payload,
      method: "POST",
      path,
    })
  } catch (e) {
    console.log("Cafe24UploadLocalImage", e)
  }
}

exports.ShippingData = async ({ category, startDate, endDate, page = 1 }) => {
  try {
    const response = await axios({
      url: `https://datalab.naver.com/shoppingInsight/getCategoryKeywordRank.naver`,
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        // 'Accept': '*/*',
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
        referer: `https://datalab.naver.com/shoppingInsight/sCategory.naver`,
      },
      responseType: "arraybuffer",
      params: {
        cid: category,
        startDate,
        endDate,
        page,
      },
    })
    return JSON.parse(response.data.toString())
  } catch (e) {
    console.log("ShippingData", category, page)
    console.log("ShippingData", e)
    return null
  }
}
