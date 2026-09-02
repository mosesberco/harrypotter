import { daily, strip } from "@/lib/bank";
import DailyBoard from "@/components/DailyBoard";

/* One question a day, the same one for everybody, rotating through the whole
   verified bank before it repeats. */
export const dynamic = "force-dynamic";

export default function DailyPage() {
  const { question, index } = daily();
  return <DailyBoard question={strip(question)} dayIndex={index} />;
}
