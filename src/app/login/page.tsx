"use client";

import { useFormState, useFormStatus } from "react-dom";
function page() {
  return (
    <form action={() => console.log("authenticating...")}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <LoginButton />
    </form>
  );
}

const LoginButton = () => {
  const { pending } = useFormStatus();

  return (
    <button aria-disabled={pending} type="submit">
      Login
    </button>
  );
};

export default page;
