import Puzzle from "@/_client/Puzzle";
import "./global.css";
import PuzzleAuto from "@/_client/PuzzleAuto";
import PuzzleAuto2 from "@/_client/PuzzleAuto2";
import PuzzleAuto3 from "@/_client/PuzzleAuto3";
import PuzzleAuto4 from "@/_client/PuzzleAuto3";

export default function Home() {
  return (
    <main>
      <Puzzle />
      {/* <PuzzleAuto /> */}
      <PuzzleAuto2 />
      <PuzzleAuto3 />
      <PuzzleAuto4 />
    </main>
  );
}
