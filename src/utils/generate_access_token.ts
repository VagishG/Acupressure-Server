import type { User } from "../interface/user";
import jwt from "jsonwebtoken";

export default function generateAccessToken(user:User) {
    return jwt.sign(
      {
        _id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role || "user", // Default role if not provided
        verified: user.verified || false, // Default verified status if not provided
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '7d'
      }
    );
  }