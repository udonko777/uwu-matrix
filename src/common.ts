export const is2dNumberArray = (value: unknown): value is number[][] => {
  if (!Array.isArray(value) || value.length <= 0) {
    return false;
  }
  return value.every(
    row => Array.isArray(row) && row.every(cell => typeof cell === "number"),
  );
};
