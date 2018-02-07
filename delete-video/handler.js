'use strict'

const Minio = require('minio')

let minioClient = new Minio.Client({
  endPoint: 'minio.rapture',
  port: 9000,
  secure: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
})

module.exports = (context, callback) => {
  let req = JSON.parse(context)

  let res = {
    req: req,
    mak: process.env.MINIO_ACCESS_KEY,
    msk: process.env.MINIO_SECRET_KEY
  }
  callback(null, res)

  // minioClient.removeObject(req.bucket, req.fileName, (err) => {
  //   if (err) callback(err, null)
  //   callback(null, 'OK')
  // })
}
