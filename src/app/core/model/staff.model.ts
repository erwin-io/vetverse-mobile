import { Gender } from "./gender.model";
import { User } from "./user.model";

export class Staff {
  staffid: string;
  firstName: string;
  middleName?: any;
  lastName: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  address: string;
  gender: Gender;
  user: User;
}
