import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-max my-5">
      <Image
        className="my-10"
        src="/assets/images/404.png"
        width={450}
        height={450}
        alt="Not Found"
      />
      <Link
        href="/"
        className="animate-bounce border rounded-2xl p-3 shadow-2xl hover:bg-lime-500"
      >
        Regressar ao ecra principal
      </Link>
    </div>
  );
}
