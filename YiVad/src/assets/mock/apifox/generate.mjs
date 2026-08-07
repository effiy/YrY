/**
 * Convert Easy-Mock geeker APIs -> Apifox OpenAPI 3.0 + Mock Scripts
 * Logic preserved from src/assets/mock/geeker/**
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GEEKER = path.join(ROOT, 'geeker');
const OUT = __dirname;

const ADMIN_TOKEN = 'bqddxxwqmfncffacvbpkuxvwvqrhln';
const USER_TOKEN = 'unufvdotdqxuzfbdygovfmsbftlvbn';
const PWD_MD5 = 'e10adc3949ba59abbe56e057f20f883e'; // 123456

function loadEasyMock(rel) {
  let text = fs.readFileSync(path.join(GEEKER, rel), 'utf8').trim();
  if (text.endsWith(',')) text = text.slice(0, -1);
  return vm.runInNewContext(`(${text})`, {}, { timeout: 5000 });
}

function evalStatic(rel, req = { body: {}, header: {} }) {
  const mock = loadEasyMock(rel);
  const Mock = { mock: (x) => x };
  const out = {};
  for (const [k, v] of Object.entries(mock)) {
    out[k] = typeof v === 'function' ? v({ _req: req, Mock }) : v;
  }
  return out;
}

const menuMock = loadEasyMock('menu/list.json');
const buttonsMock = loadEasyMock('auth/buttons.json');
const menuAdmin = menuMock.data({
  _req: { header: { 'x-access-token': ADMIN_TOKEN }, body: {} },
  Mock: { mock: (x) => x },
});
const menuUser = menuMock.data({
  _req: { header: { 'x-access-token': USER_TOKEN }, body: {} },
  Mock: { mock: (x) => x },
});
const buttonsAdmin = buttonsMock.data({
  _req: { header: { 'x-access-token': ADMIN_TOKEN } },
});
const buttonsUser = buttonsMock.data({
  _req: { header: { 'x-access-token': USER_TOKEN } },
});

const staticResponses = {
  logout: evalStatic('logout.json'),
  user_add: evalStatic('user/add.json'),
  user_edit: evalStatic('user/edit.json'),
  user_delete: evalStatic('user/delete.json'),
  user_change: evalStatic('user/change.json'),
  user_import: evalStatic('user/import.json'),
  user_export: evalStatic('user/export.json'),
  user_rest_password: evalStatic('user/rest_password.json'),
  user_status: evalStatic('user/status.json'),
  user_gender: evalStatic('user/gender.json'),
  user_department: evalStatic('user/department.json'),
  user_role: evalStatic('user/role.json'),
  file_upload_video: evalStatic('file/upload/video.json'),
};

const AVATARS = [
  'https://i.imgtg.com/2023/01/16/QRBHS.jpg',
  'https://i.imgtg.com/2023/01/16/QRqMK.jpg',
  'https://i.imgtg.com/2023/01/16/QR57a.jpg',
  'https://i.imgtg.com/2023/01/16/QRa0s.jpg',
];
const ACCOUNT_AVATARS = [
  'https://iamge-1259297738.cos.ap-chengdu.myqcloud.com/img/20220728110013.jpg',
  'https://iamge-1259297738.cos.ap-chengdu.myqcloud.com/img/20220728110015.jpg',
  'https://iamge-1259297738.cos.ap-chengdu.myqcloud.com/img/20220728110012.jpg',
  'https://iamge-1259297738.cos.ap-chengdu.myqcloud.com/img/20220728110032.jpg',
];

/** Build Apifox mock script that mirrors Easy-Mock function fields */
function scriptFromEasyMockObject(objLiteralSource) {
  // We hand-write scripts for clarity; this helper unused for complex ones
  return objLiteralSource;
}

// ---------- Mock Scripts (logic identical to Easy-Mock) ----------
const scripts = {};

scripts['login'] = `// Migrated from Easy-Mock: /geeker/login
// password is MD5 of "123456": ${PWD_MD5}
var MockJs = require('mockjs');
var body = $$.mockRequest.body.toJSON() || {};
var username = body.username;
var password = body.password;
var okAdmin = username === 'admin' && password === '${PWD_MD5}';
var okUser = username === 'user' && password === '${PWD_MD5}';

if (okAdmin) {
  $$.mockResponse.setBody({
    code: 200,
    data: MockJs.mock({ access_token: '${ADMIN_TOKEN}' }),
    msg: 'success'
  });
} else if (okUser) {
  $$.mockResponse.setBody({
    code: 200,
    data: MockJs.mock({ access_token: '${USER_TOKEN}' }),
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
`;

scripts['auth-buttons'] = `// Migrated from Easy-Mock: /geeker/auth/buttons
var token = $$.mockRequest.headers.get('x-access-token');
var data;
if (token === '${ADMIN_TOKEN}') {
  data = ${JSON.stringify(buttonsAdmin, null, 2)};
} else if (token === '${USER_TOKEN}') {
  data = ${JSON.stringify(buttonsUser, null, 2)};
}
$$.mockResponse.setBody({ code: 200, data: data, msg: 'success' });
$$.mockResponse.setCode(200);
`;

scripts['menu-list'] = `// Migrated from Easy-Mock: /geeker/menu/list
var token = $$.mockRequest.headers.get('x-access-token');
var data;
if (token === '${ADMIN_TOKEN}') {
  data = ${JSON.stringify(menuAdmin)};
} else if (token === '${USER_TOKEN}') {
  data = ${JSON.stringify(menuUser)};
}
$$.mockResponse.setBody({ code: 200, data: data, msg: 'success' });
$$.mockResponse.setCode(200);
`;

scripts['file-upload-img'] = `// Migrated from Easy-Mock: /geeker/file/upload/img
var MockJs = require('mockjs');
$$.mockResponse.setBody({
  code: 200,
  data: MockJs.mock({
    'fileUrl|1': ${JSON.stringify(AVATARS)}
  }),
  msg: 'success'
});
$$.mockResponse.setCode(200);
`;

function buildUserListItemTemplate(withChildren) {
  const children = withChildren
    ? `,
          'children|3': [{
            "id": "@string(number,18)",
            "username": query.username ? query.username : "@cname",
            "gender": query.gender ? query.gender : "@integer(1, 2)",
            "user": { "detail": { "age": query.age ? query.age : "@integer(10,30)" } },
            "idCard": query.idCard ? query.idCard : "@id",
            "email": query.email ? query.email : "@email",
            "address": "@city(true)",
            "createTime": "@date @time",
            "status": query.status !== undefined ? query.status : "@integer(0, 1)",
            "avatar|1": ${JSON.stringify(AVATARS)}
          }]`
    : '';
  return `{
          "id": "@string(number,18)",
          "username": query.username ? query.username : "@cname",
          "gender": query.gender ? query.gender : "@integer(1, 2)",
          "user": { "detail": { "age": query.age ? query.age : "@integer(10,30)" } },
          "idCard": query.idCard ? query.idCard : "@id",
          "email": query.email ? query.email : "@email",
          "address": "@city(true)",
          "createTime": "@date @time",
          "status": query.status !== undefined ? query.status : "@integer(0, 1)",
          "avatar|1": ${JSON.stringify(AVATARS)}${children}
        }`;
}

scripts['user-list'] = `// Migrated from Easy-Mock: /geeker/user/list
var MockJs = require('mockjs');
var query = $$.mockRequest.body.toJSON() || {};
var item = ${buildUserListItemTemplate(false)};
var data;
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
`;

scripts['user-tree-list'] = `// Migrated from Easy-Mock: /geeker/user/tree/list
var MockJs = require('mockjs');
var query = $$.mockRequest.body.toJSON() || {};
var item = ${buildUserListItemTemplate(true)};
var data;
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
`;

scripts['account-list'] = `// Migrated from Easy-Mock: /geeker/account/list
var MockJs = require('mockjs');
var query = $$.mockRequest.body.toJSON() || {};
var itemTpl = {
  "id": "@string(number,20)",
  "username": query.username ? query.username : "@cname",
  "gender": query.gender ? query.gender : "@integer(1, 2)",
  "idCard": query.idCard ? query.idCard : "@id",
  "email": query.email ? query.email : "@email",
  "address": "@city(true)",
  "createTime": "@date @time",
  "status": query.status !== undefined ? query.status : "@integer(0, 1)",
  "avatar|1": ${JSON.stringify(ACCOUNT_AVATARS)}
};
var data;
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
`;

// Write scripts
const scriptDir = path.join(OUT, 'mock-scripts');
fs.mkdirSync(scriptDir, { recursive: true });
for (const [name, content] of Object.entries(scripts)) {
  fs.writeFileSync(path.join(scriptDir, `${name}.js`), content);
}

// ---------- OpenAPI ----------
const ResultSchema = {
  type: 'object',
  properties: {
    code: { type: 'integer', example: 200 },
    data: {},
    msg: { type: 'string', example: 'success' },
  },
};

function op({ summary, folder, method, requestBody, responses, scriptKey, description, tags }) {
  const o = {
    summary,
    tags: tags || [folder],
    description: description || '',
    'x-apifox-folder': folder,
    'x-apifox-status': 'released',
    responses: responses || {
      '200': {
        description: 'success',
        content: {
          'application/json': {
            schema: ResultSchema,
          },
        },
      },
    },
  };
  if (requestBody) o.requestBody = requestBody;
  if (scriptKey && scripts[scriptKey]) {
    o.description =
      (o.description ? o.description + '\n\n' : '') +
      `> Apifox advanced mock script at \`mock-scripts/${scriptKey}.js\` (paste into Advanced Mock → Script and toggle on after import)`;
    // Apifox custom extension: recognized by some versions; harmless if unsupported
    o['x-apifox'] = {
      mockScript: {
        enable: true,
        script: scripts[scriptKey],
      },
    };
  }
  return o;
}

function jsonBody(example, schema) {
  return {
    required: true,
    content: {
      'application/json': {
        schema: schema || { type: 'object' },
        ...(example !== undefined ? { example } : {}),
      },
    },
  };
}

function jsonResp(example, examples) {
  const content = {
    'application/json': {
      schema: ResultSchema,
    },
  };
  if (examples) content['application/json'].examples = examples;
  else if (example !== undefined) content['application/json'].example = example;
  return {
    '200': {
      description: 'success',
      content,
      'x-apifox-name': 'success',
    },
  };
}

const paths = {
  '/geeker/login': {
    post: op({
      summary: 'User login',
      folder: 'Auth',
      scriptKey: 'login',
      requestBody: jsonBody(
        { username: 'admin', password: PWD_MD5 },
        {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string', description: 'MD5(plaintext password); demo password is 123456' },
          },
        }
      ),
      responses: jsonResp(undefined, {
        adminSuccess: {
          summary: 'admin login success',
          value: { code: 200, data: { access_token: ADMIN_TOKEN }, msg: 'success' },
        },
        userSuccess: {
          summary: 'user login success',
          value: { code: 200, data: { access_token: USER_TOKEN }, msg: 'success' },
        },
        fail: {
          summary: 'invalid username or password',
          value: { code: 500, data: null, msg: 'invalid username or password' },
        },
      }),
    }),
  },
  '/geeker/logout': {
    post: op({
      summary: 'Logout',
      folder: 'Auth',
      responses: jsonResp(staticResponses.logout),
    }),
  },
  '/geeker/menu/list': {
    get: op({
      summary: 'Get menu list',
      folder: 'Auth',
      scriptKey: 'menu-list',
      description: 'Returns different menus based on the x-access-token header (admin / user)',
      responses: jsonResp(undefined, {
        admin: {
          summary: 'admin menu',
          value: { code: 200, data: menuAdmin, msg: 'success' },
        },
        user: {
          summary: 'user menu',
          value: { code: 200, data: menuUser, msg: 'success' },
        },
      }),
    }),
  },
  '/geeker/auth/buttons': {
    get: op({
      summary: 'Get button permissions',
      folder: 'Auth',
      scriptKey: 'auth-buttons',
      description: 'Returns different button permissions based on the x-access-token header',
      responses: jsonResp(undefined, {
        admin: {
          summary: 'admin button permissions',
          value: { code: 200, data: buttonsAdmin, msg: 'success' },
        },
        user: {
          summary: 'user button permissions',
          value: { code: 200, data: buttonsUser, msg: 'success' },
        },
      }),
    }),
  },
  '/geeker/user/list': {
    post: op({
      summary: 'Get user list',
      folder: 'User Management',
      scriptKey: 'user-list',
      requestBody: jsonBody({
        pageNum: 1,
        pageSize: 10,
        username: '',
        gender: undefined,
        idCard: '',
        email: '',
        status: undefined,
      }),
      responses: jsonResp({
        code: 200,
        data: { list: [], pageNum: 1, pageSize: 10, total: 2000 },
        msg: 'success',
      }),
    }),
  },
  '/geeker/user/tree/list': {
    post: op({
      summary: 'Get tree-shaped user list',
      folder: 'User Management',
      scriptKey: 'user-tree-list',
      requestBody: jsonBody({ pageNum: 1, pageSize: 10 }),
      responses: jsonResp({
        code: 200,
        data: { list: [], pageNum: 1, pageSize: 10, total: 2000 },
        msg: 'success',
      }),
    }),
  },
  '/geeker/user/add': {
    post: op({
      summary: 'Add user',
      folder: 'User Management',
      requestBody: jsonBody({ id: '1' }),
      responses: jsonResp(staticResponses.user_add),
    }),
  },
  '/geeker/user/edit': {
    post: op({
      summary: 'Edit user',
      folder: 'User Management',
      requestBody: jsonBody({}),
      responses: jsonResp(staticResponses.user_edit),
    }),
  },
  '/geeker/user/delete': {
    post: op({
      summary: 'Delete user',
      folder: 'User Management',
      requestBody: jsonBody({}),
      responses: jsonResp(staticResponses.user_delete),
    }),
  },
  '/geeker/user/change': {
    post: op({
      summary: 'Toggle user status',
      folder: 'User Management',
      requestBody: jsonBody({}),
      responses: jsonResp(staticResponses.user_change),
    }),
  },
  '/geeker/user/import': {
    post: op({
      summary: 'Import users',
      folder: 'User Management',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
          },
        },
      },
      responses: jsonResp(staticResponses.user_import),
    }),
  },
  '/geeker/user/export': {
    post: op({
      summary: 'Export users',
      folder: 'User Management',
      requestBody: jsonBody({}),
      responses: jsonResp(staticResponses.user_export),
    }),
  },
  '/geeker/user/rest_password': {
    post: op({
      summary: 'Reset password',
      folder: 'User Management',
      requestBody: jsonBody({}),
      responses: jsonResp(staticResponses.user_rest_password),
    }),
  },
  '/geeker/user/status': {
    get: op({
      summary: 'User status dictionary',
      folder: 'User Management',
      responses: jsonResp(staticResponses.user_status),
    }),
  },
  '/geeker/user/gender': {
    get: op({
      summary: 'User gender dictionary',
      folder: 'User Management',
      responses: jsonResp(staticResponses.user_gender),
    }),
  },
  '/geeker/user/department': {
    get: op({
      summary: 'Department tree',
      folder: 'User Management',
      responses: jsonResp(staticResponses.user_department),
    }),
  },
  '/geeker/user/role': {
    get: op({
      summary: 'Role list',
      folder: 'User Management',
      responses: jsonResp(staticResponses.user_role),
    }),
  },
  '/geeker/account/list': {
    post: op({
      summary: 'Account list',
      folder: 'Account Management',
      scriptKey: 'account-list',
      requestBody: jsonBody({ pageNum: 1, pageSize: 10 }),
      responses: jsonResp({
        code: 200,
        data: { datalist: [], pageNum: 1, pageSize: 10, total: 18 },
        msg: 'success',
      }),
    }),
  },
  '/geeker/file/upload/img': {
    post: op({
      summary: 'Upload image',
      folder: 'File Upload',
      scriptKey: 'file-upload-img',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
          },
        },
      },
      responses: jsonResp({
        code: 200,
        data: { fileUrl: AVATARS[0] },
        msg: 'success',
      }),
    }),
  },
  '/geeker/file/upload/video': {
    post: op({
      summary: 'Upload video',
      folder: 'File Upload',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
          },
        },
      },
      responses: jsonResp(staticResponses.file_upload_video),
    }),
  },
};

// Add security header note for token-based APIs
for (const p of ['/geeker/menu/list', '/geeker/auth/buttons']) {
  paths[p].get.parameters = [
    {
      name: 'x-access-token',
      in: 'header',
      required: false,
      schema: { type: 'string' },
      description: `admin: ${ADMIN_TOKEN} | user: ${USER_TOKEN}`,
      example: ADMIN_TOKEN,
    },
  ];
}

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Geeker-Admin Mock API',
    description: [
      'Migrated from Easy-Mock (geeker) to Apifox.',
      '',
      '## Import guide',
      '1. Apifox → Project Settings → Import Data → OpenAPI/Swagger → select `geeker.openapi.json`',
      '2. Recommended options: import Servers as environments; conflict handling — overwrite existing endpoints (first import) or smart merge',
      '3. For dynamic-logic endpoints: open "Advanced Mock → Script", paste the content of `mock-scripts/*.js`, and toggle on',
      '',
      '## Accounts',
      `- admin / 123456 (body.password is MD5: ${PWD_MD5}) → token: ${ADMIN_TOKEN}`,
      `- user / 123456 (same as above) → token: ${USER_TOKEN}`,
      '',
      '## Proxy',
      'Original Easy-Mock base URL: `https://mock.mengxuegu.com/mock/629d727e6163854a32e8307e`',
      'After import, change `VITE_PROXY` in `.env.development` to the Apifox Mock URL.',
    ].join('\n'),
    version: '1.0.0',
  },
  servers: [
    {
      url: 'https://mock.apifox.cn/m1/{projectId}',
      description: 'Apifox cloud Mock (replace projectId after import)',
      variables: { projectId: { default: 'YOUR_PROJECT_ID' } },
    },
    {
      url: 'http://127.0.0.1:4523/m1/{projectId}',
      description: 'Apifox local Mock',
      variables: { projectId: { default: 'YOUR_PROJECT_ID' } },
    },
  ],
  tags: [
    { name: 'Auth' },
    { name: 'User Management' },
    { name: 'Account Management' },
    { name: 'File Upload' },
  ],
  paths,
  components: {
    securitySchemes: {
      AccessToken: {
        type: 'apiKey',
        in: 'header',
        name: 'x-access-token',
        description: 'access_token returned by the login endpoint',
      },
    },
    schemas: {
      Result: ResultSchema,
    },
  },
};

const openapiPath = path.join(OUT, 'geeker.openapi.json');
fs.writeFileSync(openapiPath, JSON.stringify(openapi, null, 2));

// Also write a expectations helper JSON for login/menu/buttons (optional manual create)
const expectations = {
  _comment:
    'Optional: create manually in Apifox under "Advanced Mock → Expectations" by condition. For dynamic list endpoints, prefer mock-scripts.',
  login: [
    {
      name: 'admin success',
      conditions: [
        { type: 'body', paramName: 'username', comparator: 'eq', value: 'admin' },
        { type: 'body', paramName: 'password', comparator: 'eq', value: PWD_MD5 },
      ],
      body: { code: 200, data: { access_token: ADMIN_TOKEN }, msg: 'success' },
    },
    {
      name: 'user success',
      conditions: [
        { type: 'body', paramName: 'username', comparator: 'eq', value: 'user' },
        { type: 'body', paramName: 'password', comparator: 'eq', value: PWD_MD5 },
      ],
      body: { code: 200, data: { access_token: USER_TOKEN }, msg: 'success' },
    },
    {
      name: 'failure',
      conditions: [],
      body: { code: 500, data: null, msg: 'invalid username or password' },
    },
  ],
  'menu/list': [
    {
      name: 'admin menu',
      conditions: [{ type: 'header', paramName: 'x-access-token', comparator: 'eq', value: ADMIN_TOKEN }],
      body: { code: 200, data: menuAdmin, msg: 'success' },
    },
    {
      name: 'user menu',
      conditions: [{ type: 'header', paramName: 'x-access-token', comparator: 'eq', value: USER_TOKEN }],
      body: { code: 200, data: menuUser, msg: 'success' },
    },
  ],
  'auth/buttons': [
    {
      name: 'admin buttons',
      conditions: [{ type: 'header', paramName: 'x-access-token', comparator: 'eq', value: ADMIN_TOKEN }],
      body: { code: 200, data: buttonsAdmin, msg: 'success' },
    },
    {
      name: 'user buttons',
      conditions: [{ type: 'header', paramName: 'x-access-token', comparator: 'eq', value: USER_TOKEN }],
      body: { code: 200, data: buttonsUser, msg: 'success' },
    },
  ],
};
fs.writeFileSync(path.join(OUT, 'geeker.mock-expectations.json'), JSON.stringify(expectations, null, 2));

console.log('Generated:');
console.log(' -', openapiPath);
console.log(' -', path.join(OUT, 'geeker.mock-expectations.json'));
console.log(' - mock-scripts:', Object.keys(scripts).join(', '));
console.log('paths:', Object.keys(paths).length);
