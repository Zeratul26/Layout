import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  var protectedRoutes = ["/dashboard"];
  var authRoutes = ["/login", "/register"];
  var pathname = request.nextUrl.pathname;

  var isProtectedRoute = protectedRoutes.some(function (r) {
    return pathname.startsWith(r);
  });
  var isAuthRoute = authRoutes.some(function (r) {
    return pathname.startsWith(r);
  });

  // Check if user has Supabase auth cookies
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

  // Protect dashboard routes
  if (!hasAuthCookie && isProtectedRoute) {
    var url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "Devi effettuare il login per accedere");
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from login/register
  if (hasAuthCookie && isAuthRoute) {
    var url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
