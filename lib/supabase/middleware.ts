// @ts-nocheck
import { NextResponse } from "next/server";

export async function updateSession(request) {
  var pathname = request.nextUrl.pathname;

  var hasAuthCookie = false;
  var allCookies = request.cookies.getAll();
  for (var i = 0; i < allCookies.length; i++) {
    if (
      allCookies[i].name.indexOf("sb-") === 0 &&
      allCookies[i].name.indexOf("-auth-token") > 0
    ) {
      hasAuthCookie = true;
      break;
    }
  }

  if (!hasAuthCookie && pathname.startsWith("/dashboard")) {
    var url = new URL("/login", request.url);
    url.searchParams.set("error", "Devi effettuare il login per accedere");
    return NextResponse.redirect(url);
  }

  if (
    hasAuthCookie &&
    (pathname.startsWith("/login") || pathname.startsWith("/register"))
  ) {
    var url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
