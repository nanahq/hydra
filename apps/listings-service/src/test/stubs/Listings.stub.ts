import { ListingCategory, ListingMenu, ListingOptionGroup, ResponseWithStatus } from '@app/common'
import { type Types } from 'mongoose'

export function ListingMenuStub (): ListingMenu {
  const objectId = '63f93c9f248f6c43d0b76502' as unknown as Types.ObjectId
  return {
    _id: objectId,
    vendorId: '63f7f2d0a0f1d5158f43cb7b',
    name: 'Chicken Wing',
    desc: 'A chicken cooked in marinated soy sauce',
    price: '2500',
    serving: 'per plate',
    photo: 'https://storage.googleapis.com/eatlater_vendors_bucket/a.png',
    isLive: true,
    isAvailable: true,
    isDeleted: false,
    createdAt: '',
    updatedAt: '',
    optionGroups: [
      '63f93c3a248f6c43d0b764f7'
    ]
  }
}

export function ListingCategoryStub (): ListingCategory {
  const objectId = '63f93c9f248f6c43d0b76502' as unknown as Types.ObjectId

  return {
    _id: objectId,
    vendor: '63f7f2d0a0f1d5158f43cb7b',
    name: 'Japanese Food',
    createdAt: '',
    updatedAt: '',
    tags: [
      'african',
      'lunch'
    ],
    isLive: true,
    listingsMenu: [],
    isDeleted: false
  }
}

export function ListingOptionStub (): ListingOptionGroup {
  const objectId = '63f93c9f248f6c43d0b76502' as unknown as Types.ObjectId
  return {
    _id: objectId,
    vendorId: '63f60affe401a826e81c176c',
    name: 'Main Protien',
    min: 0,
    max: 2,
    isDeleted: false,
    options: [
      {
        name: 'Cow meat',
        price: '300'
      },
      {
        name: 'Goat meat',
        price: '200'
      }
    ]
  }
}

export function resStub (): ResponseWithStatus {
  return { status: 1 }
}
