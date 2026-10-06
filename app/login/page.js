import LoginForm from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import styles from "@/components/auth.module.css";

export const metadata = { title: "會員登入｜LOGO" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }) {
  if (await getCurrentUser()) redirect("/account");

  const sp = await searchParams;
  const next = typeof sp?.next === "string" ? sp.next : "/";
  const justReset = sp?.reset === "1";

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>會員登入</h1>
      <LoginForm next={next} justReset={justReset} />
    </div>
  );
}
