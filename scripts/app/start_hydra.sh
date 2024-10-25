#!/bin/bash

ROOT_PATH='../../'

# Get the version of Node.js and extract the major version
NODE_VERSION=$(node -v)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')

# Check if the major version of Node.js is not 20
if [ "$NODE_MAJOR_VERSION" -ne 20 ]; then
    echo "This script requires Node.js version 20. Found version $NODE_VERSION"
    exit 1  # Exit with a status of 1.
fi

# Check if PM2 is installed
if ! which pm2 > /dev/null; then
   echo "pm2 not found, attempting to install it..."
   npm install -g pm2
   if [ $? -ne 0 ]; then
       echo "Failed to install pm2, please check errors and try manually."
       exit 2
   fi
fi

echo "Running installation with Node.js version $NODE_VERSION"

cd $ROOT_PATH


#Gatewats
pm2 start "yarn start:dev api-gateway" --name "ApiGateway"
pm2 start "yarn start:dev vendor-gateway" --name "VendorGateway"
#pm2 start "yarn start:dev admin-gateway" --name "AdminGateway"

#Services

pm2 start "yarn start:dev users-service" --name "UsersService"
pm2 start "yarn start:dev location-service" --name "LocationService"
pm2 start "yarn start:dev drivers-service" --name "DriversService"
pm2 start "yarn start:dev vendors-service" --name "VendorsService"
#pm2 start "yarn start:dev admin-service" --name "AdminService"
pm2 start "yarn start:dev payment-service" --name "PaymentService"
pm2 start "yarn start:dev reviews-service" --name "ReviewsService"
pm2 start "yarn start:dev orders-service" --name "OrdersService"
pm2 start "yarn start:dev notification-service" --name "NotificationService"
pm2 start "yarn start:dev listings-service" --name "ListingsService"
