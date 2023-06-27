const mongoose = require("mongoose");
const moment = require("moment");

const NaverJapanReviewItemSchema = mongoose.Schema({
  productNo: {
    type: String,
    unique: true,
    index: true,
  },
  displayName: String,
  detailUrl: String,
  name: String,
  categoryId: String,
  category1: String,
  category2: String,
  category3: String,
  category4: String,
  categoryName: String,
  maxPrice: Number,
  minPrice: Number,
  image: String,
  sellerTags: [
    {
      code: Number,
      text: String,
    },
  ],
  purchaseCnt: Number,
  reviewCount: Number,
  zzim: Number,
  openDate: String,
  createdAt: {
    type: Date,
    index: true,
    default: () => moment().toDate(),
  },
  originArea: String,
  actionGrade: Number,
  manufacturerName: String,
  brandName: String,
  brandId: Number,
  modelName: String,
  monthlyCnt: Number,
  productAttributes: [
    {
      attributeValueSeq: Number,
      attributeSeq: Number,
      attributeName: String,
      attributeClassificationType: String,
      minAttributeValue: String,
      minAttributeValueUnitText: String,
      maxAttributeValueUnitText: String,
      attributeRealValueUnitText: String,
    },
  ],
});

module.exports = mongoose.model(
  "NaverJapanReviewItem",
  NaverJapanReviewItemSchema
);
