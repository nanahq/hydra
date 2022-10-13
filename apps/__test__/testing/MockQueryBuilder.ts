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
  addSelect: () => baseCreateQueryBuilder
} as any
