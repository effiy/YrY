// Request response params (excluding data)
// YiAi unified envelope: { code: 0, message: "success", data: T }
export interface Result {
  code: number;
  message: string;
}

// Request response params (including data)
export interface ResultData<T = any> extends Result {
  data: T;
}

// Pagination response params (matches YiAi's query_documents return)
export interface ResPage<T> {
  list: T[];
  pageNum: number;
  pageSize: number;
  total: number;
}

// Pagination request params
export interface ReqPage {
  pageNum: number;
  pageSize: number;
}

// ── File upload module ──

export namespace Upload {
  export interface ResFileUrl {
    fileUrl: string;
  }
}

// ── Login module ──

export namespace Login {
  export interface ReqLoginForm {
    username: string;
    password: string;
  }
  export interface ResLogin {
    access_token: string;
    username: string;
  }
  export interface ResAuthButtons {
    [key: string]: string[];
  }
}

// ── User management module ──

// Document shape stored in MongoDB "users" collection
export interface UserDocument {
  key: string;
  id: string;  // alias for key (used by existing views)
  username: string;
  password?: string;
  gender: number;
  idCard: string;
  email: string;
  address: string;
  status: number;
  avatar: string;
  photo?: any[];
  createdTime: string;
  updatedTime: string;
  children?: UserDocument[];
}

export namespace User {
  export interface ReqUserParams extends ReqPage {
    username?: string;
    gender?: number;
    idCard?: string;
    email?: string;
    address?: string;
    createTime?: string[];
    status?: number;
  }
  export type ResUserList = UserDocument;
  export interface ResStatus {
    userLabel: string;
    userValue: number;
  }
  export interface ResGender {
    genderLabel: string;
    genderValue: number;
  }
  export interface ResDepartment {
    id: string;
    name: string;
    children?: ResDepartment[];
  }
  export interface ResRole {
    id: string;
    name: string;
    children?: ResDepartment[];
  }
}
