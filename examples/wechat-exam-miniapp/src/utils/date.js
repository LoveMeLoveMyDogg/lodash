// 输出自然日字符串，作为每日题目与历史记录的唯一键。
export function formatDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function formatDisplayDate(dateKey) {
  const [year, month, day] = dateKey.split('-');
  return `${year} 年 ${month} 月 ${day} 日`;
}
