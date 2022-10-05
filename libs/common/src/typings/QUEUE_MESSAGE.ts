export enum QUEUE_MESSAGE {
  VALIDATE_USER = 'validate_user',
  GET_USER = 'get_user',
  CREATE_USER = 'create_user',
  VERIFY_PHONE = 'verify_phone',
  SEND_PHONE_VERIFICATION = 'send_phone_verification',
  UPDATE_USER_STATUS = 'update_user_status',
  GET_USER_LOCAL = 'get_user_with_email_password',
  GET_USER_JWT = 'get_user_with_id',
  GET_ADMIN_LOCAL = 'get_admin_with_username_password',
  GET_ADMIN_JWT = 'get_admin_with_id',
  GET_ADMIN = 'get_admin',
  GET_VENDOR = 'get_vendor',
  GET_VENDOR_LOCAL = 'get_vendor_with_email_password',
  GET_VENDOR_JWT = 'get_vendor_with_id',
  CREATE_ADMIN = 'create_admin',
  CREATE_VENDOR = 'create_vendor',
  UPDATE_VENDOR_STATUS = 'update_vendor_status',
  VALIDATE_VENDOR = 'validate_vendor',
  VALIDATE_ADMIN = 'validate_admin',
  UPDATE_USER_PROFILE = 'update_user_profile',
  UPDATE_VENDOR_PROFILE = 'update_vendor_profile',
  DELETE_USER_PROFILE='delete_user_profile'
}

export enum QUEUE_SERVICE {
  USERS_SERVICE = 'USERS',
  API_SERVICE = 'API',
  NOTIFICATION_SERVICE = 'NOTIFICATION',
  VENDORS_SERVICE = 'VENDORS',
  VENDORS_API = 'VENDORS_API',
  ADMIN_API = 'ADMIN_API',
  ADMIN_SERVICE = 'ADMIN',
}
