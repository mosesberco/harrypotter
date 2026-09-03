import { daily, strip } from "@/lib/bank";
import DailyBoard from "@/components/DailyBoard";

/* Three questions a day — a person, a place and a spell — the same three for
   everybody, reset at midnight in Jerusalem. */
export const dynamic = "force-dynamic";

export default function DailyPage() {
  const { questions } = daily();
  return <DailyBoard questions={questions.map(strip)} />;
}
