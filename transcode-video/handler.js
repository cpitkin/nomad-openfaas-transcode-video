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
            mounts: [
              {
                target: '/minio',
                source: 'minio',
                readonly: false
              },
              {
                target: '/tv',
                source: 'tv',
                readonly: false
              },
              {
                target: '/movies',
                source: 'movies',
                readonly: false
              }
            ],
            command: 'transcode-video'
          },
          Resources: {
            CPU: 5000,
            MemoryMB: 4096
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
    args.push('/minio/' +
    req.Key.replace(' ', '\ ').replace('(', '\(').replace(')', '\)'))

    args.push('--no-log')
    args.push('--output')

    let path = req.Key.split('/')
    if (path[1] === 'movies') {
      args.push('/movies')
    } else if (path[1] === 'tv') {
      args.push('/tv')
    } else {
      let er = 'Incorrect media type. Should be one of tv or movies'
      callback(er, null)
    }

    job.Job.TaskGroups[0].Tasks[0].Config.args = args
    job.Job.ID = 'vt-' + randomize('a', 10)

    startJob(job)
  }

  replaceValues(jobTemplate)
}
