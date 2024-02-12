function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="m-4 mt-10">
      <section className="border-2 border-slate-600 rounded-md p-7 shadow-2xl">
        <h1 className="text-lg mb-3">{children}</h1>
      </section>
    </div>
  );
}

export default layout;
