import { NextResponse, NextRequest } from 'next/server'
import { sessionCookie } from './lib/const'
import { auth, firestore } from './firebase/server'
import { adminRoleId } from './app/api/admin/seed/roles/route'

const adminPaths = [
  '/admin',
  '/api/admin',
]

const userPaths = [
  '/app',
  '/account',
  '/api/user',
]

const pathsRequireAuth = [
  ...adminPaths,
  ...userPaths
]

const pathsToCheckRevokedIdToken = [
  '/api/token'
]

const publicPaths = [
  '/ads.txt',
  '/app-ads.txt'
]

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const headers = request.headers
  let userId: string
  let response: NextResponse
  let deleteSessionCookie = false
  const accept = headers.get('accept') || ''
  const contentType = headers.get('content-type')?.toLowerCase() || ''
  const isJsonRequest = contentType.includes('application/json')

  const wantsJSON =
    accept.includes('application/json') ||
    pathname.startsWith('/api') ||
    isJsonRequest
  // eslint-disable-next-line no-unused-vars
  const wantsHTML =
    !wantsJSON &&
    (accept.includes('text/html') || accept === '*/*' || accept === '')

  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(sessionCookie)
  if (cookie) {
    try {
      const checkRevoked = pathsToCheckRevokedIdToken.some(path => pathname.startsWith(path))
      const decodedIdToken = await auth.verifySessionCookie(cookie.value, checkRevoked)
      userId = decodedIdToken.uid
    } catch {
      deleteSessionCookie = true
    }
  }

  if (pathsRequireAuth.some(path => pathname.startsWith(path))) {
    if (!userId) {
      if (wantsJSON) {
        response = NextResponse.json(
          {
            error: 'Unauthorized'
          },
          {
            status: 401
          }
        )
      } else {
        response = NextResponse.redirect(new URL('/auth/login', request.url))
      }
    }
  }

  // Check if user has Admin role for admin paths
  if (adminPaths.some(path => pathname.startsWith(path))) {
    if (userId) {
      try {
        const userRolesDoc = await firestore.collection('userRoles').doc(userId).get()
        if (userRolesDoc.exists) {
          const data = userRolesDoc.data()
          const roleIds: string[] = data?.roleIds || []
          const hasAdminRole = roleIds.includes(adminRoleId)

          if (!hasAdminRole) {
            if (wantsJSON) {
              response = NextResponse.json(
                {
                  error: 'Forbidden: Admin role required'
                },
                {
                  status: 403
                }
              )
            } else {
              response = NextResponse.redirect(new URL('/auth/login', request.url))
            }
          }
        } else {
          // User has no roles assigned
          if (wantsJSON) {
            response = NextResponse.json(
              {
                error: 'Forbidden: Admin role required'
              },
              {
                status: 403
              }
            )
          } else {
            response = NextResponse.redirect(new URL('/auth/login', request.url))
          }
        }
      } catch (error) {
        console.error('Error checking user roles:', error)
        if (wantsJSON) {
          response = NextResponse.json(
            {
              error: 'Internal server error'
            },
            {
              status: 500
            }
          )
        } else {
          response = NextResponse.redirect(new URL('/auth/login', request.url))
        }
      }
    }
  }

  if (!response) {
    response = NextResponse.next()
  }

  if (userId) {
    response.headers.set('x-user-id', userId)
  }

  if (deleteSessionCookie) {
    response.cookies.delete(sessionCookie)
  }

  return response
}
