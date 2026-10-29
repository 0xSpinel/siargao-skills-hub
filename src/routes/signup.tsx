import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";
export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [
    { title: "Sign up — Siargao Hanap-Trabaho" },
    { name: "description", content: "Create your Siargao community account with a display name and confirmed email." },
    { property: "og:title", content: "Sign up — Siargao Hanap-Trabaho" },
    { property: "og:description", content: "Join the Siargao community to post quick tasks." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: () => <AuthForm signup />,
});