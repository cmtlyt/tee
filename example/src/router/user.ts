import { defineRouter } from "@cmtlyt/tee";

export default defineRouter(({ app, router }) => {
  router.get("/user-name", app.controller.user.getName);
});
