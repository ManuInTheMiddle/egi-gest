const Footer = () => {
  return (
    <div>
      <footer className="rounded-lg border-4 border-lime-500 shadow-md m-4 bg-slate-600">
        <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
          <span className="text-sm text-white sm:text-center">
            © 2024{" "}
            <a href="https://jpm.pt/pt/inicio/" className="hover:underline">
              JPM Industry
            </a>
            . Todos Direitos Reservados.
          </span>
          <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0"></ul>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
