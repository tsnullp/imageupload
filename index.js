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
const fetch = require('node-fetch')
const gify = require("node-video-to-gif")
// let ffmpeg = require("ffmpeg")
// let ffmpegPath = require("@ffmpeg-installer/ffmpeg").path
// let ffprobePath = require("@ffprobe-installer/ffprobe").path
// let fffmpeg = require("fluent-ffmpeg")
// ffmpeg.setFfmpegPath(ffmpegPath)
// ffmpeg.setFfprobePath(ffprobePath)

// 파일 업로드 허용
app.use(fileUpload({
    createParentPath: true
}));

// 미들 웨어 추가
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.json({limit: "50000mb"}))
app.use(bodyParser.urlencoded({
  limit: "50000mb",
  extended:true
}));
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
          let base64String = req.body.base64str
          if(base64String.includes("base64,")){
            base64String = base64String.split("base64,")[1]
          }
          const bitmap = new Buffer(base64String, 'base64');  
          fs.writeFileSync(path.join(UPLOAD, fileName), bitmap)
          res.send({
              status: true,
              message: '파일이 업로드 되었습니다.',
              data: `http://tsnullp.chickenkiller.com:5100/${today}/${randomStr}.jpg`
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
          
          const base64arr = req.body.base64strs.split("PAPAGO_OCR")
          if(Array.isArray(base64arr)){
            for(const item of base64arr) {
              if(item.length > 10){
                try {
                  let randomStr = Math.random().toString(36).substring(2, 12);
                  let fileName = path.join(today, `${randomStr}.jpg`)
                  while(fs.existsSync(path.join(UPLOAD, fileName))){
          
                    randomStr = Math.random().toString(36).substring(2, 12);
                    fileName = path.join(today, `${randomStr}.jpg`)
                  }
          
                  let base64String = item
                  if(base64String.includes("base64,")){
                    base64String = base64String.split("base64,")[1]
                  }
        
                  const bitmap = new Buffer(base64String, 'base64');  
                  fs.writeFileSync(path.join(UPLOAD, fileName), bitmap)
                  data.push(`http://tsnullp.chickenkiller.com:5100/${today}/${randomStr}.jpg`)
                } catch(e){
                  console.log("에러--->", e)
                }
              }
              
            }
  
            // return response
            res.send({
                status: true,
                message: '파일들이 업로드 되었습니다.',
                data: data
            });
          } else {
            res.send({
              status: false,
              message: "파일 업로드 실패"
            })
          }
         
      }
  } catch (err) {
      console.log("err00", err)
      res.status(500).send(err);
  }
})

app.post('/upload-mp4', async (req, res) => {
  try {
      if (!req.body.mp4Url) {
          res.send({
              status: false,
              message: '파일 업로드 실패'
          });
      } else {
          const today = moment().format("YYYYMMDD")
          !fs.existsSync(UPLOAD) && fs.mkdirSync(UPLOAD)
          !fs.existsSync(path.join(UPLOAD, today)) && fs.mkdirSync(path.join(UPLOAD, today))
          let randomStr = Math.random().toString(36).substring(2, 12);
          let fileName = path.join(today, `${randomStr}.gif`)
          while(fs.existsSync(path.join(UPLOAD, fileName))){
            randomStr = Math.random().toString(36).substring(2, 12);
            fileName = path.join(today, `${randomStr}.gif`)
          }

          const response = await fetch(req.body.mp4Url)
          const buffer = await response.buffer();
          fs.writeFileSync(path.join(UPLOAD, fileName), buffer)
          
          gify(path.join(UPLOAD, fileName), 'out.gif', function(err){
            if (err) throw err;
          });

          res.send({
              status: true,
              message: '파일이 업로드 되었습니다.',
              data: `http://tsnullp.chickenkiller.com:5100/${today}/${randomStr}.gif`
          });
      }
  } catch (err) {
      res.status(500).send(err);
  }
})