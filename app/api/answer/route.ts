import { NextResponse } from "next/server";
import { byId } from "@/lib/bank";

/* The only place an answer is ever compared. The bank lives on the server, so
   opening DevTools tells you nothing. */
export async function POST(req: Request) {
  let body: { id?: string; choice?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const { id, choice } = body;
  if (typeof id !== "string" || typeof choice !== "number") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const q = byId(id);
  if (!q) return NextResponse.json({ error: "unknown question" }, { status: 404 });

  return NextResponse.json({
    correct: choice === q.answer,
    answer: q.answer,
    he: { explanation: q.he.explanation, source: q.he.source },
    en: { explanation: q.en.explanation, source: q.en.source },
  });
}
