import { daily, strip } from "@/lib/bank";
import DailyBoard from "@/components/DailyBoard";

/* The home page is the game: three questions a day — a person, a place and a
   spell — the same three for everybody, reset at midnight in Jerusalem. */
export const dynamic = "force-dynamic";

export default function Home() {
  const { questions } = daily();
  return <DailyBoard questions={questions.map(strip)} />;
}
