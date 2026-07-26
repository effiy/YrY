// ? Element common form validation rules

/**
 *  @rule Phone number
 */
export function checkPhoneNumber(rule: any, value: any, callback: any) {
  const regexp = /^(((13[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[3-8]{1})|(18[0-9]{1})|(19[0-9]{1})|(14[5-7]{1}))+\d{8})$/;
  if (value === "") callback("Please enter phone number");
  if (!regexp.test(value)) {
    callback(new Error("Please enter a valid phone number"));
  } else {
    return callback();
  }
}
