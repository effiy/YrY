// Migrated from Easy-Mock: /geeker/account/list
let MockJs = require('mockjs');
let query = $$.mockRequest.body.toJSON() || {};
let itemTpl = {
  "id": "@string(number,20)",
  "username": query.username ? query.username : "@cname",
  "gender": query.gender ? query.gender : "@integer(1, 2)",
  "idCard": query.idCard ? query.idCard : "@id",
  "email": query.email ? query.email : "@email",
  "address": "@city(true)",
  "createTime": "@date @time",
  "status": query.status !== undefined ? query.status : "@integer(0, 1)",
  "avatar|1": ["https://iamge-1259297738.cos.ap-chengdu.myqcloud.com/img/20220728110013.jpg","https://iamge-1259297738.cos.ap-chengdu.myqcloud.com/img/20220728110015.jpg","https://iamge-1259297738.cos.ap-chengdu.myqcloud.com/img/20220728110012.jpg","https://iamge-1259297738.cos.ap-chengdu.myqcloud.com/img/20220728110032.jpg"]
};
let data;
if (query.pageSize > 10) {
  data = MockJs.mock({
    "datalist|18": [itemTpl],
    "pageNum": Number(query.pageNum),
    "pageSize": Number(query.pageSize),
    "total": 18
  });
} else {
  data = MockJs.mock({
    "datalist|10": [itemTpl],
    "pageNum": Number(query.pageNum),
    "pageSize": Number(query.pageSize),
    "total": 18
  });
}
$$.mockResponse.setBody({ code: 200, data: data, msg: 'success' });
$$.mockResponse.setCode(200);
