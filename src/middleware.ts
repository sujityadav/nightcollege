import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose"; // ✅ Use jose for JWT verification

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

// ✅ Convert the secret key to a Uint8Array
const SECRET = new TextEncoder().encode(SECRET_KEY);

export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  const cookieToken = req.cookies.get("token")?.value;
  const token = authHeader?.split(" ")[1] || cookieToken;


  if (!token) {
    return redirectToLogin(req);
  }

  try {
    // ✅ Verify JWT using `jose`
    const { payload } = await jwtVerify(token, SECRET);
    console.log("Authenticated User:", payload);

    return NextResponse.next(); // ✅ Allow access to protected pages
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return redirectToLogin(req);
  }
}

// ✅ Redirect function (no `toast`, works on server)
function redirectToLogin(req: NextRequest) {
  const url = new URL("/login", req.url);
  url.searchParams.set("redirect", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

// ✅ Protect these pages and API routes
export const config = {
  matcher: [
    "/api/users/:path*", 
    "/dashboard/:path*", 
    "/profile/:path*", 
    "/buy/:path*", 
    "/addproduct/:path*", 
    "/bookinglist/:path*", 
    "/myorders/:path*"
  ],
};
