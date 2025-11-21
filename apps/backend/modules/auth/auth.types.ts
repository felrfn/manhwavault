export interface AuthRegisterInput {
  username: string;
  password: string;
  displayName?: string;
}

export interface AuthLoginInput {
  username: string;
  password: string;
}
