import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("stockfact_auth");
      throw redirect({ to: auth ? "/dashboard" : "/login" });
    }
    throw redirect({ to: "/login" });
  },
});
