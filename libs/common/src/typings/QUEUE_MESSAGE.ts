export enum QUEUE_MESSAGE {
  VALIDATE_USER = 'validate_user',
  GET_USER = 'get_user',
  GET_USER_BY_PHONE = 'get_user_by_phone',
  CREATE_USER = 'create_user',
  VERIFY_PHONE = 'verify_phone',
  SEND_PHONE_VERIFICATION = 'send_phone_verification',
  UPDATE_USER_STATUS = 'update_user_status',
  GET_USER_LOCAL = 'get_user_with_email_password',
  GET_USER_JWT = 'get_user_with_id',
  GET_SINGLE_PAYMENT_USER = 'GET_SINGLE_PAYMENT_USER',
  GET_ALL_PAYMENT_USER = 'GET_ALL_PAYMENT_USER',

  USER_ADD_COUPON = 'USER_ADD_COUPON',

  USER_REMOVE_COUPON = 'USER_REMOVE_COUPON',
  RESEND_PHONE_VERIFICATION = 'RESEND_PHONE_VERIFICATION',

  ACCOUNT_DELETE_REQUEST = 'ACCOUNT_DELETE_REQUEST',

  // ADMIN
  GET_ADMIN_LOCAL = 'get_admin_with_username_password',
  GET_ADMIN_JWT = 'get_admin_with_id',
  GET_ADMIN = 'get_admin',
  GET_ALL_ADMIN = 'get_all_admin',
  VALIDATE_ADMIN = 'validate_admin',
  UPDATE_ADMIN_STATUS = ' update_admin_status',
  DELETE_ADMIN = 'delete_admin',
  CREATE_ADMIN = 'create_admin',

  ADMIN_DASHBOARD_ORDER_METRICS = 'ADMIN_DASHBOARD_ORDER_METRICS',
  ADMIN_DASHBOARD_USER_METRICS = 'ADMIN_DASHBOARD_USER_METRICS',
  ADMIN_DASHBOARD_VENDOR_METRICS = 'ADMIN_DASHBOARD_VENDOR_METRICS',
  ADMIN_DASHBOARD_LISTING_METRICS = 'ADMIN_DASHBOARD_LISTING_METRICS',
  ADMIN_DASHBOARD_PAYMENT_METRICS = 'ADMIN_DASHBOARD_PAYMENT_METRICS',
  RESET_ADMIN_PASSWORD = 'RESET_ADMIN_PASSWORD',

  GET_VENDOR_HOMEPAGE = 'GET_VENDOR_HOMEPAGE',
  GET_VENDOR_WEBPAGE_LISTING = 'GET_VENDOR_WEBPAGE_LISTING',
  CHECK_PHONE_NUMBER = 'CHECK_PHONE_NUMBER',
  GET_VENDOR = 'get_vendor',

  UPDATE_VENDOR_REVIEW = 'UPDATE_VENDOR_REVIEW',
  GET_VENDOR_SETTINGS = 'get_vendor_settings',
  CREATE_VENDOR_SETTINGS = 'create_vendor_settings',
  GET_VENDOR_LOCAL = 'get_vendor_with_email_password',
  GET_VENDOR_JWT = 'get_vendor_with_id',
  CREATE_VENDOR = 'create_vendor',
  UPDATE_VENDOR_STATUS = 'update_vendor_status',
  VALIDATE_VENDOR = 'validate_vendor',
  UPDATE_USER_PROFILE = 'update_user_profile',
  UPDATE_VENDOR_SETTING = 'update_vendor_settings',
  UPDATE_VENDOR_LOGO = 'update_vendor_logo',
  UPDATE_VENDOR_PROFILE = 'update_vendor_profile',
  DELETE_USER_PROFILE = 'delete_user_profile',
  DELETE_VENDOR_PROFILE = 'delete_vendor_profile',
  GET_ALL_VENDORS = 'get_all_vendors',
  GET_VENDOR_WITH_LISTING = 'get_vendor_with_listing',
  GET_WEBAPP_VENDOR_WITH_LISTING = 'get_webapp_vendor_with_listing',
  GET_ALL_VENDORS_USERS = 'get_vendors_user',
  UPDATE_USER_ORDER_COUNT = 'UPDATE_USER_ORDER_COUNT',
  UPDATE_VENDOR_IMAGE = 'UPDATE_VENDOR_IMAGE',
  VENDOR_APPROVE = 'VENDOR_APPROVE',
  VENDOR_DISAPPROVE = 'VENDOR_DISAPPROVE',

  GET_VENDOR_CAT_USER = 'GET_VENDOR_CAT_USER',

  VALIDATE_DRIVER = 'VALIDATE_DRIVER',

  GET_ALL_USERS = 'GET_ALL_USERS',
  GET_ALL_USERS_PAYMENTS = 'GET_ALL_USERS_PAYMENTS',

  // Listing
  GET_ALL_LISTINGS = 'get_listings',
  GET_LISTING_MENU = 'get_listing_info',
  DELETE_LISTING = 'delete_listing',
  CREATE_LISTING = 'create_listing',
  UPDATE_LISTING = 'update_listing',
  GET_ALL_LISTING_ADMIN = 'get_listings_admin',
  GET_ALL_LISTING_USER = 'get_listings_user',
  CREATE_LISTING_MENU = 'create_listing_menu',
  CREATE_LISTING_CAT = ' create_listing_cat',
  CREATE_LISTING_OP = 'create_listing_op',
  GET_LISTING_CAT = ' get_listing_cat',
  GET_LISTING_OP = 'get_listing_op',
  GET_ALL_VENDOR_LISTING_MENU = 'get_all_listing_menu',
  GET_ALL_LISTING_CAT = ' get_all_listing_cat',
  GET_ALL_LISTING_OP = 'get_all_listing_op',
  UPDATE_LISTING_MENU = 'update_listing_menu',
  UPDATE_LISTING_CAT = ' update_listing_cat',
  UPDATE_LISTING_OP = 'update_listing_op',
  DELETE_LISTING_MENU = 'delete_listing_menu',
  DELETE_LISTING_CAT = 'delete_listing_cat',
  DELETE_LISTING_OP = 'delete_listing_op',
  LISTING_READ = 'LISTING_READ',
  LISTING_ADMIN_LIST_ALL = 'LISTING_ADMIN_LIST_ALL',
  LISTING_ADMIN_LIST_PENDING = 'LISTING_ADMIN_LIST_PENDING',
  LISTING_ADMIN_LIST_APPROVED = 'LISTING_ADMIN_LIST_APPROVED',
  LISTING_ADMIN_LIST_REJECTED = 'LISTING_ADMIN_LIST_REJECTED',
  LISTING_MENU_APPROVE = 'LISTING_MENU_APPROVE',
  LISTING_MENU_REJECT = 'LISTING_MENU_REJECT',

  CREATE_SCHEDULED_LISTING = 'CREATE_SCHEDULED_LISTING',
  GET_SCHEDULED_LISTINGS = 'GET_SCHEDULED_LISTINGS',
  GET_SCHEDULED_LISTINGS_USER = 'GET_SCHEDULED_LISTINGS_USER',
  GET_SINGLE_LISTING_MENU_USER = 'GET_SINGLE_LISTING_MENU_USER',
  GET_SINGLE_LISTING_CAT_USER = 'GET_SINGLE_LISTING_CAT_USER',
  GET_ALL_LISTING_CAT_USER = 'GET_ALL_LISTING_CAT_USER',
  GET_ALL_LISTING_MENU_USER = 'GET_ALL_LISTING_MENU_USER',
  //  Orders
  GET_ALL_ORDERS = 'get_all_orders',
  GET_SINGLE_ORDER_BY_REFNUM = 'get_single_order_by_refnum',
  GET_SINGLE_ORDER_BY_ID = 'get_single_order_by_id',
  GET_USER_ORDERS = 'get_users_order_by_id',
  GET_VENDORS_ORDERS = 'get_vendors_order_by_id',
  UPDATE_ORDER_STATUS = 'update_order_status',
  UPDATE_ORDER_REVIEW = 'UPDATE_ORDER_REVIEW',

  UPDATE_ORDER_STATUS_PAID = 'UPDATE_ORDER_STATUS_PAID',

  GET_LAST_ORDER_STATUS = 'GET_LAST_ORDER_STATUS',

  PROCESS_PAID_ORDER = 'PROCESS_PAID_ORDER',
  CREATE_ORDER = 'create_new_order',
  VENDOR_ACCEPT_ORDER = 'VENDOR_ACCEPT_ORDER',

  // Order status
  ORDER_STATUS_UPDATE = 'order_status_update',

  // Reviews
  REVIEW_CREATE = 'review_create',
  REVIEW_FIND_ONE = 'review_find_one',
  REVIEW_ADMIN_GET_ALL_IN_DB = 'review_admin_get_all_in_db',
  REVIEW_GET_LISTING_REVIEWS = 'review_get_listing_reviews',
  REVIEW_GET_VENDOR_REVIEWS = 'review_get_vendor_reviews',
  REVIEW_UPDATE_ONE = 'review_update_one',
  REVIEW_DELETE_ONE = 'review_delete_one',
  REVIEW_STATS_GET_VENDOR_REVIEWS = 'review_stats_get_vendor_reviews',
  REVIEW_STATS_GET_LISTING_REVIEWS = 'review_stats_get_listing_reviews',

  REVIEW_GET_TOP_REVIEWED_LISTINGS = 'REVIEW_GET_TOP_REVIEWED_LISTINGS',
  REVIEW_GET_TOP_REVIEWED_VENDORS = 'REVIEW_GET_TOP_REVIEWED_VENDORS',

  REVIEW_GET_MOST_REVIEWED_HOMEPAGE = 'REVIEW_GET_MOST_REVIEWED_HOMEPAGE',

  // PAYMENT
  WALLET_GET_PAYOUT_VENDOR = 'WALLET_GET_PAYOUT_VENDOR',
  WALLET_GET_PAYOUT_ALL = 'WALLET_GET_PAYOUT_VENDOR_ALL',
  WALLET_CREATE_PAYOUT = 'WALLET_CREATE_PAYOUT',
  WALLET_UPDATE_PAYOUT = 'WALLET_UPDATE_PAYOUT',
  WALLET_PAYOUT_OVERVIEW = 'WALLET_PAYOUT_OVERVIEW',

  CHARGE_CREDIT_CARD = 'CHARGE_CREDIT_CARD',

  CHARGE_USSD = 'CHARGE_USSD',

  CHARGE_BANK_TRANSFER = 'CHARGE_BANK_TRANSFER',

  VERIFY_PAYMENT = 'VERIFY_PAYMENT',

  VERIFY_PAYMENT_PAYSTACK = 'VERIFY_PAYMENT_PAYSTACK',

  INITIATE_CHARGE_PAYSTACK = 'INITIATE_CHARGE_PAYSTACK',

  INITIATE_CHARGE_BACK = 'INITIATE_CHARGE_BACK',
  // Notifications
  SEND_PAYOUT_EMAILS = 'SEND_PAYOUT_EMAILS',
  SEND_SLACK_MESSAGE = 'SEND_SLACK_MESSAGE',

  //   ODSA
  ODSA_PROCESS_ORDER = 'ODSA_PROCESS_ORDER',
  ODSA_PROCESS_PRE_ORDER = 'ODSA_PROCESS_PRE_ORDER',
  ODSA_UPDATE_ORDER_STATUS = 'ODSA_UPDATE_ORDER_STATUS',
  ODSA_GET_ORDERS_PRE = 'ODSA_GET_ORDERS_PRE',

  STREAM_ORDER_UPDATES = 'STREAM_ORDER_UPDATES',
  FLEET_GET_PAYOUT_DRIVER = 'FLEET_GET_PAYOUT_DRIVER',
  FLEET_GET_ALL_PAYOUTS = 'FLEET_GET_ALL_PAYOUTS',

  LOCATION_GET_ETA = 'LOCATION_GET_ETA',
  LOCATION_GET_DELIVERY_FEE = 'LOCATION_GET_DELIVERY_FEE',
  LOCATION_GET_DELIVERY_FEE_DRIVER = 'LOCATION_GET_DELIVERY_FEE_DRIVER',
  LOCATION_GET_NEAREST_COORD = 'LOCATION_GET_NEAREST_COORD',

  LOCATION_GET_DISTANCE = 'LOCATION_GET_DISTANCE',

  LOCATION_GET_OPTIMIZE_ROUTE = 'LOCATION_GET_OPTIMIZE_ROUTE',
  LOCATION_GET_MATRIX = 'LOCATION_GET_MATRIX',
  ODSA_ASSIGN_INTERNAL_DRIVER = 'ODSA_ASSIGN_INTERNAL_DRIVER',

  // ADDRESS BOOK
  ADDRESS_BOOK_LIST = 'ADDRESS_BOOK_LIST',
  ADDRESS_BOOK_LIST_BY_USER = 'ADDRESS_BOOK_LIST_BY_USER',
  ADDRESS_BOOK_CREATE = 'ADDRESS_BOOK_CREATE',
  ADDRESS_BOOK_READ = 'ADDRESS_BOOK_READ',
  ADDRESS_BOOK_UPDATE = 'ADDRESS_BOOK_UPDATE',
  ADDRESS_BOOK_DELETE = 'ADDRESS_BOOK_DELETE',
  ADDRESS_BOOK_DELETE_BY_USER = 'ADDRESS_BOOK_DELETE_BY_USER',

  // ADDRESS BOOK LABEL
  ADDRESS_BOOK_LABEL_LIST = 'ADDRESS_BOOK_LABEL_LIST',
  ADDRESS_BOOK_LABEL_CREATE = 'ADDRESS_BOOK_LABEL_CREATE',
  ADDRESS_BOOK_LABEL_READ = 'ADDRESS_BOOK_LABEL_READ',
  ADDRESS_BOOK_LABEL_UPDATE = 'ADDRESS_BOOK_LABEL_UPDATE',
  ADDRESS_BOOK_LABEL_DELETE = 'ADDRESS_BOOK_LABEL_DELETE',

  // Homepage
  GET_NEAREST_VENDORS = 'GET_NEAREST_VENDORS',

  GET_HOMEPAGE_USERS = 'GET_HOMEPAGE_USERS',

  GET_WEBAPP_LISTINGS = 'GET_WEBAPP_LISTINGS',

  ADMIN_GET_ALL_PAID_ORDERS = 'ADMIN_GET_ALL_PAID_ORDERS',

  ADMIN_GET_ALL_FULFILLED_ORDERS = 'ADMIN_GET_ALL_FULFILLED_ORDERS',

  ADMIN_GET_ALL_TRANSIT_ORDERS = 'ADMIN_GET_ALL_TRANSIT_ORDERS',

  ADMIN_GET_ALL_ORDERS = 'ADMIN_GET_ALL_ORDERS',

  ADMIN_GET_USER_ORDERS = 'ADMIN_GET_USER_ORDERS',

  ADMIN_GET_DRIVERS = 'ADMIN_GET_DRIVERS',

  ADMIN_GET_FREE_DRIVERS = 'ADMIN_GET_FREE_DRIVERS',

  ADMIN_ASSIGN_DELIVERY = 'ADMIN_ASSIGN_DELIVERY',

  ADMIN_APPROVE_DRIVER = 'ADMIN_APPROVE_DRIVER',

  ADMIN_DELETE_DRIVER = 'ADMIN_DELETE_DRIVER',
  ADMIN_REJECT_DRIVER = 'ADMIN_REJECT_DRIVER',
  ADMIN_UPDATE_DRIVER_IS_INTERNAL = 'ADMIN_UPDATE_DRIVER_IS_INTERNAL',

  ADMIN_GET_USERS = 'ADMIN_GET_USERS',

  ADMIN_GET_DELETED_USERS = 'ADMIN_GET_DELETED_USERS',

  ADMIN_DELETE_USER = 'ADMIN_DELETE_USER',

  ADMIN_GET_REVIEWS = 'ADMIN_GET_REVIEWS',

  ADMIN_SUSPEND_REVIEW = 'ADMIN_SUSPEND_REVIEW',
  ADMIN_GET_DELIVERIES = 'ADMIN_GET_DELIVERIES',

  UPDATE_SCHEDULED_LISTING_QUANTITY = 'UPDATE_SCHEDULED_LISTING_QUANTITY',
  ADMIN_GET_DRIVER_PENDING_DELIVERIES = 'ADMIN_GET_DRIVER_PENDING_DELIVERIES',

  ADMIN_GET_DRIVER_FULFILLED_DELIVERIES = 'ADMIN_GET_DRIVER_FULFILLED_DELIVERIES',

  GET_ORDER_DELIVERY = 'GET_ORDER_DELIVERY',
  GET_VENDOR_DELIVERIES = 'GET_VENDOR_DELIVERIES',

  CREATE_VENDOR_NOTIFICATION = 'CREATE_VENDOR_NOTIFICATION',
  USER_SUBSCRIBE_TO_VENDOR = 'USER_SUBSCRIBE_TO_VENDOR',
  SEND_PUSH_NOTIFICATION_LISTING = 'SEND_PUSH_NOTIFICATION_LISTING',
  VENDOR_UPDATE_NOTIFICATION_SETTINGS = 'VENDOR_UPDATE_NOTIFICATION_SETTINGS',

  GET_USER_SUBSCRIPTIONS = 'GET_USER_SUBSCRIPTIONS',
  GET_VENDOR_SUBSCRIPTION = 'GET_VENDOR_SUBSCRIPTION',

  NOTIFICATION_LISTING_APPROVED = 'NOTIFICATION_LISTING_APPROVED',
  NOTIFICATION_LISTING_REJECTED = 'NOTIFICATION_LISTING_REJECTED',
  NOTIFICATION_SCHEDULED_SOLD_OUT = 'NOTIFICATION_SCHEDULED_SOLD_OUT',
  NOTIFICATION_APPROVE_VENDOR = 'NOTIFICATION_VENDOR_APPROVED',
  NOTIFICATION_VENDOR_REJECTED = 'NOTIFICATION_VENDOR_REJECTED',

  DRIVER_WALLET_FETCH = 'DRIVER_WALLET_FETCH',

  DRIVER_WALLET_FETCH_SINGLE_TRANSACTION = 'DRIVER_WALLET_FETCH_SINGLE_TRANSACTION',
  DRIVER_WALLET_FETCH_TRANSACTIONS = 'DRIVER_WALLET_FETCH_TRANSACTIONS',

  DRIVER_WALLET_ADD_BALANCE = 'DRIVER_WALLET_ADD_BALANCE',
  DRIVER_WALLET_DEDUCT_BALANCE = 'DRIVER_WALLET_DEDUCT_BALANCE',

  DRIVER_WALLET_CREATE_TRANSACTION = 'DRIVER_WALLET_CREATE_TRANSACTION',
  DRIVER_WALLET_CREATE_WALLET = 'DRIVER_WALLET_CREATE_WALLET',
  DRIVER_WALLET_UPDATE_TRANSACTION = 'DRIVER_WALLET_UPDATE_TRANSACTION',

  GET_COUPON_BY_CODE = 'GET_COUPON_BY_CODE',

  CREATE_COUPON = 'CREATE_COUPON',

  REDEEM_COUPON = 'REDEEM_COUPON',

  UPDATE_COUPON = 'UPDATE_COUPON',
  UPDATE_COUPON_USAGE = 'UPDATE_COUPON_USAGE',
  GET_ALL_COUPONS = 'GET_ALL_COUPONS',

  USER_WALLET_ACCOUNT_CREATED = 'USER_WALLET_ACCOUNT_CREATED',

  UPDATE_USER_PAYSTACK_INFO = 'UPDATE_USER_PAYSTACK_INFO',
  USER_WALLET_DEDUCT_BALANCE = 'USER_WALLET_DEDUCT_BALANCE',
  USER_WALLET_GET = 'USER_WALLET_GET',

  VENDORS_SEED_DATABASE = 'VENDORS_SEED_DATABASE',

  GET_USER_ADDRESS_BY_PIN = 'GET_USER_ADDRESS_BY_PIN',

  // PING REQUEST
  USER_SERVICE_REQUEST_PING = 'USER_SERVICE_REQUEST_PING',
  VENDOR_SERVICE_REQUEST_PING = 'VENDOR_SERVICE_REQUEST_PING',
  ADMIN_SERVICE_REQUEST_PING = 'ADDRESS_BOOK_REQUEST_PING',
  DRIVER_SERVICE_REQUEST_PING = 'DRIVER_SERVICE_REQUEST_PING',
  LISTING_SERVICE_REQUEST_PING = 'LISTING_SERVICE_REQUEST_PING',
  LOCATION_SERVICE_REQUEST_PING = 'LOCATION_SERVICE_REQUEST_PING',
  NOTIFICATION_SERVICE_REQUEST_PING = 'NOTIFICATION_SERVICE_REQUEST_PING',
  REVIEW_SERVICE_REQUEST_PING = 'REVIEW_SERVICE_REQUEST_PING',
  PAYMENT_SERVICE_REQUEST_PING = 'PAYMENT_SERVICE_REQUEST_PING',
  ORDER_SERVICE_REQUEST_PING = 'ORDER_SERVICE_REQUEST_PING'
}

export enum QUEUE_SERVICE {
  USERS_SERVICE = 'USERS',
  DRIVER_SERVICE = 'DRIVER',
  API_SERVICE = 'API',
  NOTIFICATION_SERVICE = 'NOTIFICATION',
  VENDORS_SERVICE = 'VENDORS',
  VENDORS_API = 'VENDORS_API',
  ADMINS_API = 'ADMINS_API',
  ADMINS_SERVICE = 'ADMINS',
  LISTINGS_SERVICE = 'LISTINGS',
  ORDERS_SERVICE = 'ORDERS',
  REVIEW_SERVICE = 'REVIEW',
  PAYMENT_SERVICE = 'PAYMENT',

  LOCATION_SERVICE = 'LOCATION',
}
