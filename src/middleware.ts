import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas públicas
const PUBLIC_PATHS = ["/", "/api/auth/login", "/api/auth/logout", "/api/company-settings", "/favicon.ico"];

// Rotas que precisam de ROOT
const ROOT_ONLY_ROUTES = ["/settings"];

// Rotas que precisam de ADMIN ou ROOT
const ADMIN_ROUTES = ["/employees", "/api/users"];

// Rotas que precisam de SUBADMIN, ADMIN ou ROOT
const SUBADMIN_ROUTES = ["/api/categories", "/api/menu-items"];

// Rotas que precisam de ADMIN ou ROOT (não OPERATOR)
const ADMIN_OR_ROOT_ROUTES = ["/dashboard", "/reports", "/payments", "/employees", "/settings"];

// Rotas que OPERATOR pode acessar (categorias, itens do menu, pedidos)
const OPERATOR_ROUTES = ["/api/categories", "/api/menu-items", "/api/menu-items/*/favorite", "/api/orders", "/api/areas", "/api/upload", "/api/payment-methods", "/api/tables", "/api/icons", "/api/dashboard", "/categories", "/menu", "/orders", "/areas"];

// Rotas que todos os usuários autenticados podem acessar
const ALL_AUTHENTICATED_ROUTES = ["/profile", "/change-password", "/api/users/change-password"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Se está em rota pública
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
    // Verificar se tem token válido
    const token = req.cookies.get('auth-token')?.value;
    if (token) {
      try {
        const userData = JSON.parse(Buffer.from(token, 'base64').toString());
        // Se autenticado e tentando acessar /, redireciona baseado no role
        if (userData.id && userData.role && pathname === "/") {
          if (userData.role === 'OPERATOR') {
            return NextResponse.redirect(new URL("/menu", req.url));
          } else {
            return NextResponse.redirect(new URL("/dashboard", req.url));
          }
        }
      } catch (error) {
        // Token inválido, limpar cookie
        const response = NextResponse.next();
        response.cookies.set('auth-token', '', { maxAge: 0 });
        return response;
      }
    }
    return NextResponse.next();
  }

  // Se NÃO está em rota pública, exige autenticação
  const token = req.cookies.get('auth-token')?.value;
  
  if (!token) {
    // Redireciona para login se não autenticado
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    // Decodificar o token
    const userData = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Verificar se o token tem os dados necessários
    if (!userData.id || !userData.role) {
      throw new Error('Token inválido');
    }

    const userRole = userData.role;

    // Verificar rotas que precisam de ROOT
    if (ROOT_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
      if (userRole !== 'ROOT') {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Verificar rotas que precisam de ADMIN ou ROOT
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
      if (userRole !== 'ADMIN' && userRole !== 'ROOT') {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Verificar rotas que precisam de SUBADMIN, ADMIN ou ROOT
    if (SUBADMIN_ROUTES.some(route => pathname.startsWith(route))) {
      if (userRole !== 'SUBADMIN' && userRole !== 'ADMIN' && userRole !== 'ROOT' && userRole !== 'OPERATOR') {
        // Apenas usuários sem permissão são redirecionados
        return NextResponse.redirect(new URL("/menu", req.url));
      }
    }

    // Verificar rotas que precisam de ADMIN ou ROOT (não OPERATOR)
    if (ADMIN_OR_ROOT_ROUTES.some(route => pathname.startsWith(route))) {
      if (userRole === 'OPERATOR') {
        // OPERATOR não pode acessar, redirecionar para menu
        return NextResponse.redirect(new URL("/menu", req.url));
      }
    }

    // Verificar rotas que todos os usuários autenticados podem acessar
    if (ALL_AUTHENTICATED_ROUTES.some(route => pathname.startsWith(route))) {
      // Todos os usuários autenticados podem acessar essas rotas
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', userData.id);
      requestHeaders.set('x-user-role', userData.role);
      requestHeaders.set('x-user-name', userData.name);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Verificar rotas que OPERATOR pode acessar
    if (OPERATOR_ROUTES.some(route => pathname.startsWith(route))) {
      // OPERATOR pode acessar essas rotas
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', userData.id);
      requestHeaders.set('x-user-role', userData.role);
      requestHeaders.set('x-user-name', userData.name);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Se chegou até aqui, o usuário tem permissão para acessar a rota
    // Adicionar dados do usuário ao header para uso nas rotas
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', userData.id);
    requestHeaders.set('x-user-role', userData.role);
    requestHeaders.set('x-user-name', userData.name);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    // Token inválido, limpar cookie e redirecionar
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.set('auth-token', '', { maxAge: 0 });
    return response;
  }
}

// Exporta como middleware
export const config = {
  matcher: ["/((?!_next|favicon.ico|images).*)"], // Aplica em tudo, exceto assets do next, favicon e imagens
};