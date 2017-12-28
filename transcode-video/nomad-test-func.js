'use strict'

const request = require('request')
const util = require('util')
const randomize = require('randomatic')

let req = {}
req.Key = 'transcode/movies/Batman and Harley Quinn (2017).mkv'
req.s3 = {}
req.s3.object = {}
req.s3.object.key = 'Batman and Harley Quinn (2017).mkv'

let options = {
  url: 'http://nomad.rapture:4646/v1/jobs',
  json: true
}

let jobTemplate = {
  Job: {
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
          command: 'transcode-video',
          args: []
        },
        Resources: {
          CPU: 6000,
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
      if (error) console.error(error)
      console.log(response.body)
      // callback(null, 'OK')
    }
  )
}

function replaceValues (job) {
  // console.log(job.Job.TaskGroups[0].Tasks[0].Config)
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
    console.error(er)
  }

  job.Job.TaskGroups[0].Tasks[0].Config.args = args
  job.Job.ID = 'vt-' + randomize('a', 10)

  console.log(util.inspect(job, { showHidden: false, depth: null }))
  // startJob(job)
}

replaceValues(jobTemplate)
