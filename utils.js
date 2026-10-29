export const SUBJECTS = ['Mathematics', 'English', 'Science', 'Social Studies'];
export const CLASSES = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
export const PASS_MARK = 50;
export const LETTERS = ['A', 'B', 'C', 'D', 'F'];

export const average = (s) => {
  const v = Object.values(s.marks || {});
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};
export const letter = (avg) =>
  avg === null ? null : avg >= 80 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : avg >= PASS_MARK ? 'D' : 'F';
export const status = (s) => {
  const a = average(s);
  return a === null ? 'No marks' : a >= PASS_MARK ? 'Pass' : 'Fail';
};

// Every dashboard / report number is calculated from the student list.
export function summarize(students) {
  const graded = students.filter((s) => average(s) !== null);
  const passed = graded.filter((s) => average(s) >= PASS_MARK).length;
  const total = graded.reduce((sum, s) => sum + average(s), 0);
  const distribution = Object.fromEntries(LETTERS.map((l) => [l, 0]));
  graded.forEach((s) => distribution[letter(average(s))]++);
  return {
    total: students.length,
    passed,
    failed: graded.length - passed,
    average: graded.length ? total / graded.length : 0,
    distribution,
  };
}
export const fmt = (n) => (n === null || n === undefined ? '—' : n.toFixed(1));
