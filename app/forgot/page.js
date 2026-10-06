import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import styles from "@/components/auth.module.css";

export const metadata = { title: "重設密碼｜LOGO" };
export const dynamic = "force-dynamic";

export default async function ForgotPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>重設密碼</h1>
      <ForgotPasswordForm />
    </div>
  );
}
