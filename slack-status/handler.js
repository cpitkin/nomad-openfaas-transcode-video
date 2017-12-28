'use strict'

const slack = require('slack')

let token = process.env.SLACK_TOKEN
let channel = '#general'

module.exports = (context, callback) => {
  let tokenError = 'Slack token is undefined'
  if (!token) callback(tokenError, null)

  let req = JSON.parse(context)

  let text = 'Transcode Status'
  let attachments = [
    {
      fallback: req.fileName + ' has status: ' + req.transcodeStatus,
      title: 'A new event occured!',
      fields: [
        {
          'title': 'File Name',
          'value': req.fileName,
          'short': false
        },
        {
          'title': 'Transcode Status',
          'value': req.transcodeStatus,
          'short': false
        },
        {
          'title': 'Nomad Evaluation ID',
          'value': req.nomadEvalId,
          'short': false
        }
      ]
    }
  ]

  if (req.transcodeStatus === 'queued') {
    attachments[0].color = '#0000FF'
  } else if (req.transcodeStatus === 'complete') {
    attachments[0].color = '#36a64f'
  }

  slack.chat.postMessage({token, channel, text}, (err) => {
    if (err) callback(err, null)
  })
}
