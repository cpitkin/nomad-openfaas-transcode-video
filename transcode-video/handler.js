'use strict'

const request = require('request')
const randomize = require('randomatic')

module.exports = (context, callback) => {
  let req = JSON.parse(context)

  let options = {
    url: 'http://nomad.rapture:4646/v1/jobs',
    json: true
  }

  let jobTemplate = {
    Job: {
      ID: 'vt',
      Name: 'video-transcode',
      Type: 'batch',
      Priority: 10,
      Datacenters: [
        'rapture'
      ],
      TaskGroups: [{
        Name: 'video-transcode-group',
        Count: 1,
        Tasks: [{
          Name: 'transcode',
          Driver: 'docker',
          Config: {
            image: 'cpitkin/video_transcode',
            volumes: [
              '/transcode:/minio'
            ],
            command: 'transcode-video'
          },
          Resources: {
            CPU: 5000,
            MemoryMB: 2048
          }
        }]
      }]
    }
  }

  function startJob (job) {
    options.body = job

    request.post(options,
      function (error, response, body) {
        if (error) callback(error, null)
        callback(null, JSON.stringify(response))
      }
    )
  }

  function replaceValues (job) {
    let args = []
    let filename = req.Key.replace(' ', '\ ').replace('(', '\(').replace(')', '\)')
    args.push(`/minio/transcode/${filename}`)
    

    args.push('--no-log')
    args.push('--output')
    let completePath = ""

    let path = req.Key.split('/')
    if (path[1] === 'movies') {
      args.push('/minio/complete/movies')
      completePath = `/minio/complete/movies/${filename}`
    } else if (path[1] === 'tv') {
      args.push('/minio/complete/tv')
      completePath = `/minio/complete/tv/${filename}`
    } else {
      let er = 'Incorrect media folder. Should be one of tv or movies'
      callback(er, null)
    }

    funcCall = `&& curl -H "Content-Type: application/json" -X POST -d '{"file":"${completePath}" http://faas.rapture:8080/function/media-upload`

    args.concat(funcCall.split(' '))

    job.Job.TaskGroups[0].Tasks[0].Config.args = args
    job.Job.ID = 'vt-' + randomize('a', 10)

    startJob(job)
  }

  replaceValues(jobTemplate)
}
