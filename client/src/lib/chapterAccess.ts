import { useMemo } from "react";
import { CHAPTERS, ALL_TERMS } from "@/data/medicalData";
import { useUser } from "@/contexts/UserContext";

const isStudyable = (t: typeof ALL_TERMS[0]) =>
  t.type !== "condition" && t.type !== "procedure";

/** Flashcard study proficiency for a chapter (0..1) — display only, does NOT unlock chapters. */
export function chapterCompletion(ch: typeof CHAPTERS[0], cleared: Set<string>): number {
  const ids = ch.termIds.filter((id: string) => {
    const t = ALL_TERMS.find(x => x.id === id);
    return t && isStudyable(t);
  });
  if (!ids.length) return 0;
  return ids.filter((id: string) => cleared.has(id)).length / ids.length;
}

/** Pass threshold (%) a student must reach on a chapter test to unlock the next chapter. */
export const CHAPTER_TEST_PASS_PCT = 70;

/**
 * Chapter numbers a student may access for study, games, and quizzes.
 * Sequential: the first chapter is always open; each later chapter opens only
 * once the student has PASSED the previous chapter's test (not by studying
 * flashcards). A moderator can unlock chapters early, and any chapter the
 * student already began stays accessible.
 */
export function computeAccessibleChapters(
  passedChapters: number[] = [],
  clearedIds: Iterable<string> = [],
  modUnlocked: number[] = []
): number[] {
  const passed = new Set(passedChapters);
  const cleared = new Set(clearedIds);
  const mod = new Set(modUnlocked);
  const out: number[] = [];
  let prevPassed = true; // first chapter is always open
  for (const ch of CHAPTERS) {
    const started = ch.termIds.some((id: string) => cleared.has(id));
    if (prevPassed || mod.has(ch.num) || started) out.push(ch.num);
    prevPassed = passed.has(ch.num);
  }
  return out;
}

export function useAccessibleChapters(): number[] {
  const { user } = useUser();
  return useMemo(
    () => computeAccessibleChapters(user?.passedChapters ?? [], user?.clearedTermIds ?? [], user?.unlockedChapters ?? []),
    [user?.passedChapters, user?.clearedTermIds, user?.unlockedChapters]
  );
}
