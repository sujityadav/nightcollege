import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/app/models/User";
import { connectDB } from "@/app/lib/mongodb";

const SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    await connectDB();
    const {  email, password,isAdmin } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({  email, password: hashedPassword ,isAdmin});

    return NextResponse.json({ success:true, message: "User created", user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({success:false, message: "Error creating user", error }, { status: 500 });
  }
}
// **Login API**
// **Login API - Keep as GET (Less Secure)**
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const password = searchParams.get("password");

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Missing credentials" }, { status: 400 });
    }



    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }



    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "30d" });

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { token } }, 
      { new: true }
    );
    
    
    if (!updatedUser) {
      console.log("Failed to update token");
      return NextResponse.json({ success: false, message: "Failed to update token" }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: "Login successful", updatedUser }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error logging in", error }, { status: 500 });
  }
}

