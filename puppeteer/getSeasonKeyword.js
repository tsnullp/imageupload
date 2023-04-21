const { NaverKeywordRel } = require("../api/Naver")

const start =  async ({ keyword }) => {
    try {
        console.log("keyword - ", keyword)
        const response = await NaverKeywordRel({keyword})
        console.log("response - ", response.keywordList[0])
    } catch(e) {
        console.log("ddd",e)
    }
}

module.exports = start