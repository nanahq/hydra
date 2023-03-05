import { ResponseWithStatus, User } from '@app/common'
import { type Types } from 'mongoose'

export function UserProfileStub (): User {
  const objectId = '63f93c9f248f6c43d0b76502' as unknown as Types.ObjectId
  return {
     _id: objectId,
    "password": "",
    "phone": "08107644333",
    "isValidated": true,
    "status": "ONLINE",
    "orders": [],
    "createdAt": "2023-03-05T04:26:02.148Z",
    "updatedAt": "2023-03-05T04:34:34.002Z",
    "firstName": "Suraj",
    "lastName": "Auwal",
    "email":"email@gmail.com",
    "isDeleted": false,
    "location": {coordinates: ["", ""]}
  }
}

export function resStub (): ResponseWithStatus {
  return {status: 1}
}