export type apiRestMetaType = {
  page: number;
  pages: number;
  limit: number;
};

export type apiResType<T> = {
  status: number;
  message: string;
  data?: T;
  meta?: apiRestMetaType;
};
