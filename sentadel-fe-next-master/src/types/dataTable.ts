export type dataTableType<TData = null> = {
  data?: TData;
  message?: string;
  meta?: {
    page: number;
    pages: number;
    limit: number;
  };
};
