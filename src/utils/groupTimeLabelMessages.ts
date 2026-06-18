interface Message {
  createAt: string;
}

export const getTimeLabelIndexes = (messages: Message[]): number[] => {
  if (messages.length === 0) return [];

  const indexes: number[] = [];
  const today = new Date().toDateString();
  let lastDate: string | null = null;
  let firstTimestampInGroup: number | null = null;

  messages.forEach((msg, index) => {
    const currentTimestamp = new Date(msg.createAt).getTime();
    const currentDate = new Date(msg.createAt).toDateString();
    const isNewDay = lastDate !== null && currentDate !== lastDate;

    if (currentDate !== today) {
      if (isNewDay || index === 0) {
        indexes.push(index);
        firstTimestampInGroup = currentTimestamp;
      }
    } else {
      if (
        index === 0 ||
        firstTimestampInGroup === null ||
        currentTimestamp - firstTimestampInGroup > 60 * 1000
      ) {
        indexes.push(index);
        firstTimestampInGroup = currentTimestamp;
      }
    }

    lastDate = currentDate;
  });

  return indexes;
};
