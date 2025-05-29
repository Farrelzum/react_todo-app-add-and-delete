export const FilterValues = {
  ALL: 'All' as const,
  ACTIVE: 'Active' as const,
  COMPLETED: 'Completed' as const,
};

export type Filter =
  | typeof FilterValues.ALL
  | typeof FilterValues.ACTIVE
  | typeof FilterValues.COMPLETED;
