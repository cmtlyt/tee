import { defineService } from "@cmtlyt/tee";

export default defineService(() => {
  return class UserService {
    getName() {
      return "UserService";
    }
  };
});
