// Migrated from Easy-Mock: /geeker/login
// password is MD5 of "123456": e10adc3949ba59abbe56e057f20f883e
var MockJs = require('mockjs');

// Apifox Mock: prefers getParam (reads from body/query/path)
var username = $$.mockRequest.getParam('username');
var password = $$.mockRequest.getParam('password');

// Fallback: parse from body in some environments
if (username == null || password == null) {
  var body = {};
  try {
    body = $$.mockRequest.body.toJSON() || {};
  } catch (e) {
    try {
      body = JSON.parse($$.mockRequest.body.toString() || '{}');
    } catch (e2) {
      body = {};
    }
  }
  if (username == null) username = body.username;
  if (password == null) password = body.password;
}

var PWD = 'e10adc3949ba59abbe56e057f20f883e';
var okAdmin = username === 'admin' && password === PWD;
var okUser = username === 'user' && password === PWD;

if (okAdmin) {
  $$.mockResponse.setBody({
    code: 200,
    data: { access_token: 'bqddxxwqmfncffacvbpkuxvwvqrhln' },
    msg: 'Success'
  });
} else if (okUser) {
  $$.mockResponse.setBody({
    code: 200,
    data: { access_token: 'unufvdotdqxuzfbdygovfmsbftlvbn' },
    msg: 'Success'
  });
} else {
  $$.mockResponse.setBody({
    code: 500,
    data: null,
    msg: 'Invalid username or password'
  });
}
$$.mockResponse.setCode(200);
