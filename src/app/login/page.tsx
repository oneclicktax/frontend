import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-primary-100 px-6 pb-12">
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-base text-white/80">초보 사장님도 할 수 있는</p>
        <h1 className="mt-3 text-center text-4xl font-extrabold tracking-[0.3em] text-white leading-snug">
          원 클 릭<br />원 천 세
        </h1>
      </div>

      <Link href="/api/auth/kakao" className="w-full max-w-sm">
        <Image
          src="/kakao_login.png"
          alt="카카오 로그인"
          width={600}
          height={90}
          className="w-full"
          priority
        />
      </Link>
    </div>
  );
}
