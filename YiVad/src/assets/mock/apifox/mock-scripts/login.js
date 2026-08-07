// Migrated from Easy-Mock: /geeker/login
// password is MD5 of "123456": e10adc3949ba59abbe56e057f20f883e
let MockJs = require('mockjs');
let body = $$.mockRequest.body.toJSON() || {};
let username = body.username;
let password = body.password;
let okAdmin = username === 'admin' && password === 'e10adc3949ba59abbe56e057f20f883e';
let okUser = username === 'user' && password === 'e10adc3949ba59abbe56e057f20f883e';

if (okAdmin) {
  $$.mockResponse.setBody({
    code: 200,
    data: MockJs.mock({ access_token: 'bqddxxwqmfncffacvbpkuxvwvqrhln' }),
    msg: 'success'
  });
} else if (okUser) {
  $$.mockResponse.setBody({
    code: 200,
    data: MockJs.mock({ access_token: 'unufvdotdqxuzfbdygovfmsbftlvbn' }),
    msg: 'success'
  });
} else {
  $$.mockResponse.setBody({
    code: 500,
    data: null,
    msg: 'invalid username or password'
  });
}
$$.mockResponse.setCode(200);
