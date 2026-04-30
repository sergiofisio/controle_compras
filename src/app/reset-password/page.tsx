import { ResetPasswordClient } from "@/app/reset-password/ResetPasswordClient";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";

  return <ResetPasswordClient token={token} />;
}
