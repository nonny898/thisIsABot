import * as functions from 'firebase-functions';
import * as request from 'request-promise-native';
import * as crypto from 'crypto';

// 1. Copy your Channel Secret from LINE Developers Console then paste is as a value
const LINE_CHANNEL_SECRET = '686af79a6b11585a0cae5e395fea6cda';
// 2. Copy your Agent ID from dialogflow then paste is as a value
const dialogflowWebHook = 'https://bots.dialogflow.com/line/d94dbd73-c563-486e-8b0b-88e261de3589/webhook';
// create signature from body
const signature = (body: any) => crypto.createHmac('SHA256', LINE_CHANNEL_SECRET).update(body).digest('base64').toString();

const mapEvent = (event: any) => {
  if (event.type === 'message' && event.message.type === 'text') {
    return event;
  } else {
    return {
      timestamp: event.timestamp,
      source: event.source,
      replyToken: event.replyToken,
      type: 'message',
      message: { type: 'text', text: 'event = ' + (event.type === 'message') ? event.message.type : event.type }
    }
  }
}

const postRequestToDialogflow = (req: functions.https.Request) => {
  const body = JSON.stringify({
    destination: req.body.destination,
    events: req.body.events.map(mapEvent)
  });
  req.headers["x-line-signature"] = signature(body);
  req.headers.host = "bots.dialogflow.com";
  return request.post({
    uri: dialogflowWebHook,
    headers: req.headers,
    body
  });
}

exports.LineAdapter = functions.https.onRequest((req, res) => {
  if (req.method === "POST") {
    const body = JSON.stringify(req.body);
    if (signature(body) !== req.headers['x-line-signature']) {
      return res.status(401).send('Unauthorized');
    }
    return postRequestToDialogflow(req).then(result => {
      console.log(result);
      return res.status(200).send(req.method);
    }).catch(error => {
      console.error(error);
      return res.status(200).send(req.method);
    });
  }
  return res.status(401).send('Unauthorized');
});
