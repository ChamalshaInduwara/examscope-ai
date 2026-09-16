import type { NextAuthConfig } from "next-auth";

const protectedRoutes = [
  "/dashboard",
  "/subjects",
  "/uploads",
  "/analysis",
  "/predictions",
  "/generate",
  "/mock-exams",
  "/revision",
  "/analytics",
  "/profile",
];

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);

      const isProtectedRoute = protectedRoutes.some(
        (route) =>
          nextUrl.pathname === route ||
          nextUrl.pathname.startsWith(`${route}/`)
      );

      const isAuthPage =
        nextUrl.pathname === "/login" ||
        nextUrl.pathname === "/register";

      if (isProtectedRoute) {
        return isLoggedIn;
      }

      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },

  providers: [],
} satisfies NextAuthConfig;