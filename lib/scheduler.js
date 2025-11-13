function getTimeUntilNextThreeHour() {
  const now = new Date();
  const currentHour = now.getHours();

  const intervals = [0, 3, 6, 9, 12, 15, 18, 21];

  let nextHour = intervals.find((h) => h > currentHour);

  const nextTime = new Date(now);

  if (nextHour === undefined) {
    nextHour = 0;
    nextTime.setDate(nextTime.getDate() + 1);
  }

  nextTime.setHours(nextHour, 0, 0, 0);

  return nextTime.getTime() - now.getTime();
}

module.exports = { getTimeUntilNextThreeHour };
