import React from "react";

const Formulario = () => {
  return (
    <form className="flex flex-col gap-4 items-center justify-center text-center">
      <input id="username" type="text" name="username" placeholder="Username" />
      <input
        id="password"
        type="password"
        name="password"
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Formulario;
