export type Spot = {
  id: string;
  name: string;
  action: string[];
};

export type AccessMenu = {
  menu: {
    id: string;
    name: string;
    spots: Spot[];
  };
};

export type User = {
  id: string;
  name: string;
  role: string;
  roleId: string;
  userCode: string;
  accessCode: string;
  photo: string | null;
  accessMenu: AccessMenu[];
};

export type UserState = {
  token: string;
  user: User;
};
