import { Gender } from './gender.model';
import { Role } from './role.model';
import { UserType } from './usertype.model';

export class LoginResult {
  clientId: string;
  userId: string;
  username: string;
  userType: UserType;
  fullName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  address: string;
  gender: Gender;
  birthDate: Date;
  role: Role;
  accessToken: any;
  refreshToken: any;
  userTypeIdentityId: string;
  totalUnreadNotif: number;
  lastCancelledDate: Date;
  numberOfCancelledAttempt: string;
  userProfilePic: any;
  isVerified: boolean;
}
