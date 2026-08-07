// Migrated from Easy-Mock: /geeker/user/list
let MockJs = require('mockjs');
let query = $$.mockRequest.body.toJSON() || {};
let item = {
          "id": "@string(number,18)",
          "username": query.username ? query.username : "@cname",
          "gender": query.gender ? query.gender : "@integer(1, 2)",
          "user": { "detail": { "age": query.age ? query.age : "@integer(10,30)" } },
          "idCard": query.idCard ? query.idCard : "@id",
          "email": query.email ? query.email : "@email",
          "address": "@city(true)",
          "createTime": "@date @time",
          "status": query.status !== undefined ? query.status : "@integer(0, 1)",
          "avatar|1": ["https://i.imgtg.com/2023/01/16/QRBHS.jpg","https://i.imgtg.com/2023/01/16/QRqMK.jpg","https://i.imgtg.com/2023/01/16/QR57a.jpg","https://i.imgtg.com/2023/01/16/QRa0s.jpg"]
        };
let data;
if (query.username || query.gender || query.age || query.idCard || query.email || query.status !== undefined) {
  data = MockJs.mock({
    "list|10": [item],
    "pageNum": Number(query.pageNum),
    "pageSize": Number(query.pageSize),
    "total": 18
  });
} else if (query.pageSize == 25) {
  data = MockJs.mock({
    "list|25": [item],
    "pageNum": Number(query.pageNum),
    "pageSize": Number(query.pageSize),
    "total": 2000
  });
} else if (query.pageSize == 50) {
  data = MockJs.mock({
    "list|50": [item],
    "pageNum": Number(query.pageNum),
    "pageSize": Number(query.pageSize),
    "total": 2000
  });
} else if (query.pageSize == 100) {
  data = MockJs.mock({
    "list|100": [item],
    "pageNum": Number(query.pageNum),
    "pageSize": Number(query.pageSize),
    "total": 2000
  });
} else {
  data = MockJs.mock({
    "list|10": [item],
    "pageNum": Number(query.pageNum),
    "pageSize": Number(query.pageSize),
    "total": 2000
  });
}
$$.mockResponse.setBody({ code: 200, data: data, msg: 'success' });
$$.mockResponse.setCode(200);
