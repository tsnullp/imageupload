const mongoose = require("mongoose")
const moment = require("moment")

const NaverMall = mongoose.Schema({
  mallNo: String,
  mallName: String,
  mallPcUrl: String,
  channelID: String,
  brandUrl: String,
  seachLabel: Number,
  businessName: String,
  representativeName: String,
  csTell: String,
  businessNo: String,
  businessAddress: String,
  mailOrderNo: String,
  email: String,
  createdAt: {
    type: Date,
    default: () => moment().toDate(),
  },
  lastUpdate: {
    type: Date,
    default: () => moment().toDate(),
  },
  productCount: Number,
  saleCount: Number,
})

module.exports = mongoose.model("NaverMall", NaverMall)
