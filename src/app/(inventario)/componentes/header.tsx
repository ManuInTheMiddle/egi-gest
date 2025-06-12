import React from "react";

const Header = () => {
  return (
    <div className="container flex flex-row space-x-1">
      <div className="col-span-full sm:col-span-4">
        <label
          htmlFor="artigo"
          className="block text-sm/6 font-medium text-gray-700"
        >
          Artigo
        </label>
        <div className="mt-2">
          <input
            id="artigo"
            name="artigo"
            type="text"
            autoComplete="address-level2"
            className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-lime-600 sm:text-sm/6"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
