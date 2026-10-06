import RegisterForm from "@/components/RegisterForm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import styles from "@/components/auth.module.css";

export const metadata = { title: "會員註冊｜LOGO" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/account");

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>會員註冊</h1>
      <RegisterForm />
    </div>
  );
}
