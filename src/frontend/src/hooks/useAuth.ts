import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { Role } from "../backend";
import type { UserPublic } from "../types";
import { useBackend } from "./useBackend";

interface AuthContextValue {
  user: UserPublic | null;
  isLoading: boolean;
  isAdmin: boolean;
  loginStatus: string;
  login: () => void;
  logout: () => void;
  refetchUser: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: false,
  isAdmin: false,
  loginStatus: "not-started",
  login: () => {},
  logout: () => {},
  refetchUser: () => {},
});

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

export function useAuthProvider(): AuthContextValue {
  const { loginStatus, login, clear, identity } = useInternetIdentity();
  const { actor, isFetching } = useBackend();
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery<UserPublic | null>({
    queryKey: ["profile", identity?.getPrincipal().toText()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching && loginStatus === "success",
    staleTime: 30_000,
  });

  const logout = () => {
    clear();
    queryClient.clear();
  };

  return {
    user: user ?? null,
    isLoading: isLoading || isFetching,
    isAdmin: user?.role === Role.admin,
    loginStatus,
    login,
    logout,
    refetchUser: () => refetch(),
  };
}
