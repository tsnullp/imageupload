const mongoose = require("mongoose")
const moment = require("moment")

const NaverBestItemSchema = mongoose.Schema({
  type: String,
  productNo: {
    type: String,
    unique: true,
    index: true
  },
  displayName: String,
  detailUrl: String,
  name: String,
  title: String,
  categoryId: String,
  category1: String,
  category2: String,
  category3: String,
  category4: String,
  salePrice: Number,
  image: String,
  sellerTags: [String],
  reviewCount: Number,
  createdAt: {
    type: Date,
    index: true,
    default: () => moment().toDate()
  },
  originArea: String,
})

module.exports = mongoose.model("NaverBestItem", NaverBestItemSchema)
