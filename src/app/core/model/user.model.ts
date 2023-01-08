import { Role } from "./role.model";
import { UserType } from "./usertype.model";

export class User {
  userId: string;
  username: string;
  userType: UserType;
  role: Role;
  enable:boolean;
  userProfilePic: any;
}
