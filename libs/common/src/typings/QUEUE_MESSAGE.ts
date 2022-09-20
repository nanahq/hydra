export enum QUEUE_MESSAGE {
  VALIDATE_USER = 'validate_user',
  GET_USER = 'get_user',
  CREATE_USER = 'create_user',
  VERIFY_PHONE = 'verify_phone',
  SEND_PHONE_VERIFICATION = 'send_phone_verification',
  UPDATE_USER_STATUS = 'update_user_status',
  GET_USER_LOCAL = 'get_user_with_email_password',
  GET_USER_JWT = 'get_user_with_id',
}

export enum QUEUE_SERVICE {
  USERS_SERVICE = 'USERS',
  API_SERVICE = 'API',
  NOTIFICATION_SERVICE = 'NOTIFICATION',
}
