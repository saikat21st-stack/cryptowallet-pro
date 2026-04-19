import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import AdminLayout from "./components/AdminLayout";
import Layout from "./components/Layout";
import { AuthContext, useAuthProvider } from "./hooks/useAuth";

import AdminPage from "./pages/AdminPage";
import AdminTicketsPage from "./pages/AdminTicketsPage";
import AdminTransactionsPage from "./pages/AdminTransactionsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
// Page imports
import DashboardPage from "./pages/DashboardPage";
import DepositPage from "./pages/DepositPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SupportPage from "./pages/SupportPage";
import TradingPage from "./pages/TradingPage";
import TransfersPage from "./pages/TransfersPage";

// Root route with AuthProvider
function RootComponent() {
  const auth = useAuthProvider();
  return (
    <AuthContext.Provider value={auth}>
      <Outlet />
    </AuthContext.Provider>
  );
}

// Auth guard wrapper
function UserLayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
function AdminLayoutWrapper() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

// Route definitions
const rootRoute = createRootRoute({ component: RootComponent });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const userLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "user-layout",
  component: UserLayoutWrapper,
});

const indexRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});

const dashboardRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const tradingRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/trading",
  component: TradingPage,
});

const transfersRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/transfers",
  component: TransfersPage,
});

const supportRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/support",
  component: SupportPage,
});

const depositRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/deposit",
  component: DepositPage,
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin-layout",
  component: AdminLayoutWrapper,
  // Note: Admin auth guard requires access to AuthContext which is set in RootComponent.
  // TanStack Router's beforeLoad runs before the component tree is rendered, so context
  // from AuthContext.Provider is not available here. Admin pages handle role checks
  // internally via the AdminLayout component.
});

const adminRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin",
  component: AdminPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/users",
  component: AdminUsersPage,
});

const adminTransactionsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/transactions",
  component: AdminTransactionsPage,
});

const adminTicketsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/tickets",
  component: AdminTicketsPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  userLayoutRoute.addChildren([
    indexRoute,
    dashboardRoute,
    tradingRoute,
    transfersRoute,
    supportRoute,
    depositRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminRoute,
    adminUsersRoute,
    adminTransactionsRoute,
    adminTicketsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
