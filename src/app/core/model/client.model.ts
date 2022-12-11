import { Gender } from "./gender.model";
import { User } from "./user.model";

export class Client {
  clientId: string;
  firstName: string;
  middleName?: any;
  lastName: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  address: string;
  birthDate: string;
  age: string;
  gender: Gender;
  user: User;
  lastCancelledDate: Date;
  numberOfCancelledAttempt: string;
}
