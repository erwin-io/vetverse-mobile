import { Gender } from "./gender.model";
import { User } from "./user.model";

export class ApiResponse<T> {
  data: T;
  message: boolean;
  success: boolean;
}
