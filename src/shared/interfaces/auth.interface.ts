export type IJwtAccessClaims = {
  sub: string;
  email: string;
};

export type IPayloadJWT = {
  sub: string;
  email: string;
  name: string;
  status: string;
};
