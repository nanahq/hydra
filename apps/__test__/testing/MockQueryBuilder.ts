export const baseCreateQueryBuilder = {
  delete: () => baseCreateQueryBuilder,
  into: () => baseCreateQueryBuilder,
  insert: () => baseCreateQueryBuilder,
  values: () => baseCreateQueryBuilder,
  where: () => baseCreateQueryBuilder,
  getOne: () => baseCreateQueryBuilder,
  execute: () => baseCreateQueryBuilder,
  returning: () => baseCreateQueryBuilder,
  update: () => baseCreateQueryBuilder,
  set: () => baseCreateQueryBuilder,
  addSelect: () => baseCreateQueryBuilder,
  leftJoinAndSelect: () => baseCreateQueryBuilder,
  getMany: () => baseCreateQueryBuilder,
  preload: () => baseCreateQueryBuilder,
  andWhere: () => baseCreateQueryBuilder
} as any
