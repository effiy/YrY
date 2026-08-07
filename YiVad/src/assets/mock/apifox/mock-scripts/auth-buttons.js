// Migrated from Easy-Mock: /geeker/auth/buttons
let token = $$.mockRequest.headers.get('x-access-token');
let data;
if (token === 'bqddxxwqmfncffacvbpkuxvwvqrhln') {
  data = {
  "useProTable": [
    "add",
    "batchAdd",
    "export",
    "batchDelete",
    "status"
  ],
  "authButton": [
    "add",
    "edit",
    "delete",
    "import",
    "export"
  ]
};
} else if (token === 'unufvdotdqxuzfbdygovfmsbftlvbn') {
  data = {
  "useProTable": [
    "add",
    "batchDelete"
  ],
  "authButton": [
    "add",
    "edit",
    "delete",
    "import",
    "export"
  ]
};
}
$$.mockResponse.setBody({ code: 200, data: data, msg: 'success' });
$$.mockResponse.setCode(200);
