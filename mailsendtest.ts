import "dotenv/config";
import { prisma } from "./src/lib/prisma";
import { createVerificationToken, verifyEmailToken } from "./src/lib/verification";
import { sendVerificationEmail } from "./src/lib/mail";

async function main() {
  const email = `diag-${Date.now()}@expense-tracker.local`;
  const user = await prisma.user.create({
    data: { name: "Diag", email, password: "not-used" },
  });

  try {
    const rawToken = await createVerificationToken(user.id);
    console.log("raw token created:", rawToken.slice(0, 12) + "…");

    await sendVerificationEmail(email, rawToken, "en");
    console.log("email sent OK");

    const verify = await verifyEmailToken(rawToken);
    console.log("verify status:", verify.status);
  } finally {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.verificationToken.deleteMany({ where: { userId: user.id } });
  }
}

main()
  .then(() => console.log("DIAG DONE"))
  .catch((e) => {
    console.error("DIAG FAILED:", e instanceof Error ? e.message : e, "code:", (e as { code?: string })?.code);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());