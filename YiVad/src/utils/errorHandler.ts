import { ElNotification } from "element-plus";

/**
 * @description Global code error capture
 * */
const errorHandler = (error: any) => {
  // Filter HTTP request errors
  if (error.status || error.status == 0) return false;
  let errorMap: { [key: string]: string } = {
    InternalError: "Javascript engine internal error",
    ReferenceError: "Object not found",
    TypeError: "Wrong type or object used",
    RangeError: "Parameter out of range when using built-in object",
    SyntaxError: "Syntax error",
    EvalError: "Incorrect use of Eval",
    URIError: "URI error"
  };
  let errorName = errorMap[error.name] || "Unknown error";
  ElNotification({
    title: errorName,
    message: error,
    type: "error",
    duration: 3000
  });
};

export default errorHandler;
