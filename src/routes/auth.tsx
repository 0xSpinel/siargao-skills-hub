import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";
export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Log in — swell do" },
    { name: "description", content: "Log in to post one-off tasks for Siargao's local community." },
    { property: "og:title", content: "Log in — swell do" },
    { property: "og:description", content: "Your Siargao community account." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: AuthForm,
});