// types/express/index.d.ts
import type { User } from "../../src/interface/user";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
