import { headers } from "next/headers";
// headers()  is a next.js function that gives us access to the incoming request headers
//reads the request header from inside a server Component
// this only works in server components - not in client components

export async function getCurrentUser() {
  const headerList = await headers();
  // headerList is a Headers object - it has a .get() method to read specific headers
  const userId = headerList.get("x-user-id");
  // we set x-user-id in the proxy function (lib/proxy.ts) after verifying the token
  // this way, we can know who the user is in any server component without hitting the database again
  const role = headerList.get("x-user-role");

  const email = headerList.get("x-user-email");
  // read the custom headers proxy.ts attached
  // if proxy didn't run (unprotected route), these will be null

  if (!userId || !role || !email) {
    return null;
    // return null if headers aren't there
    // means user is not logged in or proxy didn't run
  }

  return {
    userId,
    role: role as "ADMIN" | "USER" | "GUEST",
    email,
  };
  // return a clean user object
  // pages can use this to show user info
}
