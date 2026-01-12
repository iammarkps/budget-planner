import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

const publicPaths = ["/sign-in", "/auth/callback"]

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (!user && !isPublicPath) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/sign-in"
    redirectUrl.searchParams.set("redirectedFrom", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isPublicPath) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/"
    redirectUrl.search = ""
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
