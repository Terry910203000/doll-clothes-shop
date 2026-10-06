import ResetPasswordForm from "@/components/ResetPasswordForm";
import styles from "@/components/auth.module.css";

export const metadata = { title: "設定新密碼｜LOGO" };
export const dynamic = "force-dynamic";

export default async function ResetPage({ params }) {
  const { token } = await params;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>設定新密碼</h1>
      <ResetPasswordForm token={token} />
    </div>
  );
}
