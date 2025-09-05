export type JwtPayload = {
    sub: string;       // user id (string, т.к. bigint)
    role: 'user' | 'admin';
    email: string;
    displayName: string;
    typ: 'access' | 'refresh';
  };
  