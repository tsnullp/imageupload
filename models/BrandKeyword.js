const mongoose = require("mongoose");

const brandKeywordSchema = mongoose.Schema({
  brand: String,
  brandNo: String,
  purchaseCnt: Number,
  totalPrice: Number,
  overSeeCount: Number,
  totalCount: Number,
  monthlyCnt: Number,
  searchRate: Number,
  overSerRate: Number,
  type: String,
});

module.exports = mongoose.model("brandKeyword", brandKeywordSchema);
