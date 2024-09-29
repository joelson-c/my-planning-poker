import type {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
} from "@remix-run/react";
import { redirect, useParams } from "@remix-run/react";
import { LoginCard } from "~/components/login/card";

type RouteParams = {
  roomId: string;
};

export const clientLoader = async ({ params }: ClientLoaderFunctionArgs) => {
  if (!params.roomId) {
    throw new Response(null, {
      status: 403,
    });
  }

  return null;
};

export default function Join() {
  const { roomId } = useParams<RouteParams>();

  return (
    <main>
      <LoginCard roomId={roomId} />
    </main>
  );
}

export const clientAction = async ({
  request,
  params,
}: ClientActionFunctionArgs) => {
  // TODO: Save nickname to atom
  return redirect(`/room/${params.roomId!}`);
};
