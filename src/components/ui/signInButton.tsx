"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./button";

const SignInButton = () => {
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <div className="flex gap-4 ml-auto">
        <p className="text-sky-600">{session.user.role}</p>
        <Button onClick={() => signOut} className="text-red-600">
          SignOut
        </Button>
      </div>
    );
  }
  return (
    <div className="flex gap-4 ml-auto">
      <Button onClick={() => signIn} className="text-green-600">
        SignIn
      </Button>
    </div>
  );
};
