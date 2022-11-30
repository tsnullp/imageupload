const express = require('express');
const expressSanitizer = require("express-sanitizer")
const https = require('https')
const http = require('http')
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
const mkcert = require('mkcert')


process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

const createCA = async () => {
  // create a certificate authority
  const ca = await mkcert.createCA({
    organization: 'Hello CA',
    countryCode: 'KR',
    state: 'Seoul',
    locality: 'Seocho',
    validityDays: 999999
  });

  // then create a tls certificate
  const cert = await mkcert.createCert({
    domains: ['localhost', 'tsnullp.chickenkiller.com'],
    validityDays: 999999,
    caKey: ca.key,
    caCert: ca.cert
  });

  // console.log(cert.key, cert.cert); // certificate info
  // console.log(`${cert.cert}\n${ca.cert}`); 
  return {
    key: cert.key,
    cert: cert.cert
  }
}


const startServer = async () => {
  // const options = await createCA()
  // console.log("options", options)

  const options = {
    key: fs.readFileSync(__dirname + '\\ssl\\private.key', 'utf-8'),
    cert: fs.readFileSync(__dirname + '\\ssl\\certificate.crt', 'utf-8'),
    requestCert: false,
    rejectUnauthorized: false
  }
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
  const httpsPort = 5100;
  const httpPort = 5101;

  // const httpsPort = 5200;
  // const httpPort = 5201;
  const DIR = path.join("D:", "imageupload")
  const UPLOAD = "upload"

  app.use(express.static(path.join(DIR,UPLOAD)));

  // app.listen(5102, () => {
  //   console.log(`HTTP server listening on port ${5102}.`);
  // })

  http.createServer(app).listen(httpPort, () =>{
    console.log(`HTTP server listening on port ${httpPort}.`);
  })


  app.post('/upload', async (req, res) => {
    try {
        if (!req.body.base64str) {
            res.send({
                status: false,
                message: '파일 업로드 실패'
            });
        } else {
          const TODAY = moment().format("YYYYMMDD")
          const UPLOAD_FOLDER = path.join(DIR, UPLOAD)
          const UPLOAD_FOLDER_TODAY = path.join(UPLOAD_FOLDER, TODAY)
  
          !fs.existsSync(UPLOAD) && fs.mkdirSync(UPLOAD)
          !fs.existsSync(UPLOAD_FOLDER) && fs.mkdirSync(UPLOAD_FOLDER)
          !fs.existsSync(UPLOAD_FOLDER_TODAY) && fs.mkdirSync(UPLOAD_FOLDER_TODAY)
          
            let randomStr = Math.random().toString(36).substring(2, 12);
            let fileName = path.join(TODAY, `${randomStr}.jpg`)
            while(fs.existsSync(path.join(UPLOAD_FOLDER, fileName))){
              randomStr = Math.random().toString(36).substring(2, 12);
              fileName = path.join(TODAY, `${randomStr}.jpg`)
            }
            const FILE_DIR = path.join(UPLOAD_FOLDER, fileName)
            let base64String = req.body.base64str
            if(base64String.includes("base64,")){
              base64String = base64String.split("base64,")[1]
            }
            const bitmap = new Buffer(base64String, 'base64');  
            fs.writeFileSync(FILE_DIR, bitmap)
            res.send({
                status: true,
                message: '파일이 업로드 되었습니다.',
                data: `https://tsnullp.chickenkiller.com/${TODAY}/${randomStr}.jpg`
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
          const TODAY = moment().format("YYYYMMDD")
          const UPLOAD_FOLDER = path.join(DIR, UPLOAD)
          const UPLOAD_FOLDER_TODAY = path.join(UPLOAD_FOLDER, TODAY)
  
          !fs.existsSync(UPLOAD) && fs.mkdirSync(UPLOAD)
          !fs.existsSync(UPLOAD_FOLDER) && fs.mkdirSync(UPLOAD_FOLDER)
          !fs.existsSync(UPLOAD_FOLDER_TODAY) && fs.mkdirSync(UPLOAD_FOLDER_TODAY)
            
            const base64arr = req.body.base64strs.split("PAPAGO_OCR")
            if(Array.isArray(base64arr)){
              for(const item of base64arr) {
                if(item.length > 10){
                  try {
                    let randomStr = Math.random().toString(36).substring(2, 12);
                    let fileName = path.join(TODAY, `${randomStr}.jpg`)
                    while(fs.existsSync(path.join(UPLOAD, fileName))){
            
                      randomStr = Math.random().toString(36).substring(2, 12);
                      fileName = path.join(TODAY, `${randomStr}.jpg`)
                    }
                    const FILE_DIR = path.join(UPLOAD_FOLDER, fileName)
                    let base64String = item
                    if(base64String.includes("base64,")){
                      base64String = base64String.split("base64,")[1]
                    }
          
                    const bitmap = new Buffer(base64String, 'base64');  
                    fs.writeFileSync(FILE_DIR, bitmap)
                    data.push(`https://tsnullp.chickenkiller.com/${TODAY}/${randomStr}.jpg`)
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
            const TODAY = moment().format("YYYYMMDD")
            const UPLOAD_FOLDER = path.join(DIR, UPLOAD)
            const UPLOAD_FOLDER_TODAY = path.join(UPLOAD_FOLDER, TODAY)
    
            !fs.existsSync(UPLOAD) && fs.mkdirSync(UPLOAD)
            !fs.existsSync(UPLOAD_FOLDER) && fs.mkdirSync(UPLOAD_FOLDER)
            !fs.existsSync(UPLOAD_FOLDER_TODAY) && fs.mkdirSync(UPLOAD_FOLDER_TODAY)

            let randomStr = Math.random().toString(36).substring(2, 12);
            let fileName = path.join(TODAY, `${randomStr}.mp4`)
            while(fs.existsSync(path.join(UPLOAD_FOLDER, fileName))){
              randomStr = Math.random().toString(36).substring(2, 12);
              fileName = path.join(TODAY, `${randomStr}.mp4`)
            }
            const FILE_DIR = path.join(UPLOAD_FOLDER, fileName)
            const response = await fetch(req.body.mp4Url)
     
            const buffer = await response.buffer();
          
            fs.writeFileSync(FILE_DIR, buffer)
    
            gifyPromise(FILE_DIR, path.join(UPLOAD_FOLDER_TODAY, `${randomStr}.gif`))
          
            
            res.send({
                status: true,
                message: '파일이 업로드 되었습니다.',
                data: `https://tsnullp.chickenkiller.com/${TODAY}/${randomStr}.gif`
            });
        }
    } catch (err) {
      console.log("err--->", err)
        res.status(500).send(err);
    }
  })


  //https 의존성으로 certificate와 private key로 새로운 서버를 시작
  https.createServer(options, app).listen(httpsPort, () => {
    console.log(`HTTPS server started on port ${httpsPort}`);
  });

}

startServer()

const gifyPromise = (a, b) => {
  return new Promise((resolve, reject) => {
    gify(a, b, {
      // width: 100,
      // rate: 4,
      // start: 4,
      // duration: 6
    }, function(err){
    //  fs.unlink(path.join(UPLOAD, fileName))
      fs.unlinkSync(a)
      if (err) {
        console.log("err0", err)
        reject(err)
      } else {
        resolve(b)
      }
    });
  })
}