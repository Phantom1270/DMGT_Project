import type { Work } from "./analysis";
export const work = (
  id: string,
  name: string,
  prerequisites: string[] = [],
): Work => ({ id, name, prerequisites, duration: 1, completed: false });
export const taskSample = [
  work("t1", "Design database"),
  work("t2", "Build backend", ["t1"]),
  work("t3", "Build frontend"),
  work("t4", "Integrate API", ["t2", "t3"]),
  work("t5", "Deploy website", ["t4"]),
];
export const courseSample = [
  work("p", "Programming"),
  work("d", "Discrete Mathematics"),
  work("s", "Data Structures", ["p"]),
  work("a", "Algorithms", ["s", "d"]),
  work("m", "Machine Learning", ["a"]),
  work("l", "Deep Learning", ["m"]),
];
export const homeSample = {
  brightness: 20,
  temperature: 30,
  darkness: 30,
  hot: 28,
  p: true,
  m: false,
  s: false,
  o: false,
};
export const applicantSample = {
  cgpa: 8.4,
  income: 300000,
  attendance: 75,
  achievement: false,
};
export const scholarshipThresholds = {
  cgpa: 8.5,
  income: 300000,
  attendance: 75,
};
export const machineSample = { temperature: 95, vibration: 12, cooling: true };
export const machineLimits = { temperature: 80, vibration: 10 };
