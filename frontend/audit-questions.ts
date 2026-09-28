import "dotenv/config";
import { prisma } from "./lib/db/prisma";

async function main() {
  const questions = await prisma.question.findMany({
    where: {
      subject: {
        name: "Biology",
        code: "BIO-101",
      },
    },
    select: {
      id: true,
      text: true,
      year: true,
      number: true,
      type: true,
      topic: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { year: "desc" },
      { number: "asc" },
    ],
  });

  const suspicious = questions.filter((q) => {
    const text = q.text;

    return (
      /[|]{1,}/.test(text) ||
      /\.{5,}/.test(text) ||
      /\bsee page\b/i.test(text) ||
      /\b000\d{3,}\b/.test(text) ||
      /[^\x20-\x7E]{3,}/.test(text)
    );
  });

  console.log("Total questions:", questions.length);
  console.log("Suspicious questions:", suspicious.length);

  console.table(
    suspicious.slice(0, 30).map((q) => ({
      year: q.year,
      number: q.number,
      type: q.type,
      topic: q.topic?.name ?? null,
      text: q.text.slice(0, 180),
    })),
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
