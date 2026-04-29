export type ApiMessageResponse = {
  message: string;
};

export type ApiEntityResponse<Key extends string, Value> = ApiMessageResponse & Record<Key, Value>;

export type ApiListResponse<Key extends string, Value> = Record<Key, Value[]>;