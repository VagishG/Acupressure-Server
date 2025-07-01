/** @format */

import jwt from "jsonwebtoken";
import {asyncHandler} from "../utils/async_handler";
import type { Request, Response, NextFunction } from "express";
import type { User } from "../interface/user";
import { readData } from "../utils/firebase";

export const verifyJwt = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        (req.headers.authorization || "").replace("Bearer ", "");
        if (!token) {
         res.status(401).json({ message: "Unauthorized Request" });
         return;
      }
      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as { _id: string; };
      const data = await readData("users", decodedToken._id) as User | null;
      if (!data) {
         res.status(401).json({ message: "Unauthorized Request" });
         return;
      }
      const user: User = {
        id: data.id,
        email: data.email,
        phone: data.phone,
        name:data.name
      };
      req.user = user;

      next();
    } catch (err) {
       res.status(401).json({ message: `Unauthorized or Invalid token ${err}` });
       return;
    }
  }
);