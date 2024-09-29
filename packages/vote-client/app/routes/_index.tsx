import type { MetaFunction } from "@remix-run/node";
import type { ClientActionFunctionArgs } from "@remix-run/react";
import { redirect } from "@remix-run/react";
import { LoginCard } from "~/components/login/card";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <main>
      <LoginCard />
    </main>
  );
}

export const clientAction = async ({
  request,
  params,
}: ClientActionFunctionArgs) => {
  // TODO: Create and save nickname to atom
  return redirect(`/room/${params.roomId!}`);
};
