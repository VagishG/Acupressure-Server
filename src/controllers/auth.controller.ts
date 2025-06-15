import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/async_handler";
import generateAccessToken from "../utils/generate_access_token";
import { searchCollection, writeData } from "../utils/firebase";
import { nanoid } from "nanoid";
import type { User } from "../interface/user";

export const Login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || email === "" || password === "") {
    res.status(400).json({ message: "Please provide email and password" });
    return;
  }
  try {
    const user = await searchCollection("users", "email", "==", email) as User[];
    console.log("User found:", user);
    if(!user || user.length === 0) {
      res.status(401).json({ message: "No user found with the provided email" });
      return;
    }
    const foundUser = user[0]; // Assuming searchCollection returns an array of users
    if (!foundUser || !foundUser.hashed_password) {
      res.status(401).json({ message: "User does not have a password set" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, foundUser.hashed_password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }
    console.log("User authenticated successfully:", foundUser);
    const access_token = await generateAccessToken(foundUser);
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Enable secure cookies in production
      sameSite: "none", // Required for cross-origin
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days days * hours * minutes * seconds * ms
    };
    //@ts-ignore
    res.cookie("accessToken", access_token, cookieOptions);
    res.status(200).json({ message: "Login successful", user: foundUser });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
});

export const create_account = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (
    !name ||
    !email ||
    !password ||
    !phone ||
    name === "" ||
    email === "" ||
    password === "" ||
    phone === ""
  ) {
    res
      .status(400)
      .json({ message: "Please provide name, email and password" });
    return;
  }
  try {
    const uid = nanoid(10);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const docRef =await writeData("users", uid, {
      name: name,
      email: email,
      hashed_password: hashedPassword,
      phone: phone,
      created_at: new Date().toISOString(),  
    });

    res
      .status(201)
      .json({ message: "Account created successfully", user: docRef });
  } catch (error) {
    console.error("Error during account creation:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const logout = asyncHandler(async (req, res) => {
    try {
        res.clearCookie("accessToken");
        res.status(200).json({message:"Logout successfull"});
      } catch (error) {
        console.log(error);
         res.status(500).send({ message: `Internal Server Error: ${error}` });
         return;
      }
});

export const isValidUser = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }else{
        res.status(200).json({ message: "User found",user:user });
        return;
    }

});
