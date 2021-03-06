const buildSortArray = (sort) => {
  return sort
    .split(',')
    .filter((str) => str)
    .map((str) => {
      const hasDash = str[0] === '-';
      return {
        field: hasDash ? str.substring(1) : str,
        multiplier: hasDash ? -1 : 1,
      };
    });
};

const buildCompareFn = (sort) => {
  const sortByArray = buildSortArray(sort);

  return (a1, a2) => {
    if (!a1) {
      return a2 ? -1 : 0;
    }

    if (!a2) {
      return 1;
    }

    const compareFields = (field1, field2) => {
      if (!field1 && field2) {
        return -1;
      } else if (field1 && !field2){
        return 1;
      } else if (!field1 && !field2) {
        return 0;
      }

      const [f1, f2] = field1.reference
        ? [field1.reference, field2.reference]
        : field1.code
          ? [field1.code, field2.code]
          : [field1, field2];

      if (f1 < f2) {
        return -1;
      } else if (f1 === f2) {
        return 0;
      } else {
        return 1;
      }
    };

    let value = 0;
    sortByArray.forEach((sortObj) => {
      value = compareFields(a1[sortObj.field], a2[sortObj.field]) * sortObj.multiplier;
    });

    return value;
  };
};

const mergeResults = (compareFn, limit, ...arrays) => {
  let count = 0;
  const positions = arrays.map((a) => 0);
  const result = [];

  while (count < limit) {
    let winningIdx = 0;
    let winningVal = arrays[winningIdx][positions[winningIdx]];

    for (let i = 0; i < positions.length; i += 1) {
      if (
        winningVal === null ||
        winningVal === undefined ||
        (compareFn(arrays[i][positions[i]], winningVal) < 0
        && arrays[i][positions[i]])
      ) {
        winningIdx = i;
        winningVal = arrays[i][positions[i]];
      }
    }

    if (winningVal !== null && winningVal !== undefined) {
      result.push(arrays[winningIdx][positions[winningIdx]]);
      positions[winningIdx] += 1;
      count += 1;
    } else {
      break;
    }
  }

  return [result, positions];
};

module.exports = {
  buildSortArray,
  buildCompareFn,
  mergeResults,
};
