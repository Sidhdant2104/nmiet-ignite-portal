/** Official NMIET department list — no free-text entry allowed. */
export const departments = [
  "Computer Engineering",
  "Computer Science & Engineering (CSE)",
  "Computer Science & Engineering (AI)",
  "Information Technology (IT)",
  "Electronics & Telecommunication (ENTC)",
  "Electronics & Computer Engineering (ECE)",
  "Artificial Intelligence & Data Science (AIDS)",
  "Mechanical Engineering",
  "BCA / MCA / MBA",
] as const;

export type Department = (typeof departments)[number];
