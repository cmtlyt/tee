import { defineController, TeeContext } from "@cmtlyt/tee";

export default defineController(({ app }) => {
  return class UserController {
    getName(ctx: TeeContext) {
      const name = app.service.user.getName();
      // console.debug("user name:", name);
      ctx.body = name;
    }
  };
});
