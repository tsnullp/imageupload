const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const morgan = require('morgan')
const _ = require('lodash')
const fs = require('fs')
const app = express();
const moment = require("moment")
const path = require("path")

// 파일 업로드 허용
app.use(fileUpload({
    createParentPath: true
}));

// 미들 웨어 추가
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(morgan('dev'));

// 포트 설정
const port = 5100;
const UPLOAD = "upload"

app.use(express.static(UPLOAD));
app.listen(port, () => {
    console.log(`Server is on port ${port}.`);
})

app.post('/upload', async (req, res) => {
  try {
      if (!req.body.base64str) {
          res.send({
              status: false,
              message: '파일 업로드 실패'
          });
      } else {
          const today = moment().format("YYYYMMDD")
          !fs.existsSync(UPLOAD) && fs.mkdirSync(UPLOAD)
          !fs.existsSync(path.join(UPLOAD, today)) && fs.mkdirSync(path.join(UPLOAD, today))
          let randomStr = Math.random().toString(36).substring(2, 12);
          let fileName = path.join(today, `${randomStr}.jpg`)
          while(fs.existsSync(path.join(UPLOAD, fileName))){
            randomStr = Math.random().toString(36).substring(2, 12);
            fileName = path.join(today, `${randomStr}.jpg`)
          }

          const bitmap = new Buffer(req.body.base64str, 'base64');  
          fs.writeFileSync(path.join(UPLOAD, fileName), bitmap)
          res.send({
              status: true,
              message: '파일이 업로드 되었습니다.',
              data: `today/${randomStr}.jpg`
          });
      }
  } catch (err) {
      res.status(500).send(err);
  }
})

app.post('/upload-multi', async(req, res) => {
  try {
      if (!req.body.base64strs) {
          res.send({
              status: false,
              message: "파일 업로드 실패"
          })
      } else {
          let data = [];
          const today = moment().format("YYYYMMDD")
          !fs.existsSync(UPLOAD) && fs.mkdirSync(UPLOAD)
          !fs.existsSync(path.join(UPLOAD, today)) && fs.mkdirSync(path.join(UPLOAD, today))
          for(const item of req.body.base64strs) {
            try {
              let randomStr = Math.random().toString(36).substring(2, 12);
              let fileName = path.join(today, `${randomStr}.jpg`)
              while(fs.existsSync(path.join(UPLOAD, fileName))){
                randomStr = Math.random().toString(36).substring(2, 12);
                fileName = path.join(today, `${randomStr}.jpg`)
              }
    
              const bitmap = new Buffer(item, 'base64');  
              fs.writeFileSync(path.join(UPLOAD, fileName), bitmap)
              data.push(`today/${randomStr}.jpg`)
            } catch(e){

            }
          }

          // return response
          res.send({
              status: true,
              message: '파일들이 업로드 되었습니다.',
              data: data
          });
      }
  } catch (err) {
      res.status(500).send(err);
  }
})