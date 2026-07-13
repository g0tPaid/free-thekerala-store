import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/manage/login',
  },
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      if (path.startsWith('/manage/login')) return true;
      if (path.startsWith('/manage')) {
        return token?.role === 'ADMIN';
      }
      return true;
    },
  },
});

export const config = {
  matcher: ['/manage/:path*'],
};
