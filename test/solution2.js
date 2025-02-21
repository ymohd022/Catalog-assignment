const fs = require('fs');

function gcd(a, b) {
  if (a < 0n) a = -a;
  if (b < 0n) b = -b;
  return b === 0n ? a : gcd(b, a % b);
}

function reduceFraction(n, d) {
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  const divisor = gcd(n, d);
  if (divisor !== 0n) {
    n /= divisor;
    d /= divisor;
  }
  return [n, d];
}


function addFractions(fracA, fracB) {
  const [n1, d1] = fracA;
  const [n2, d2] = fracB;
  const numerator = n1 * d2 + n2 * d1;
  const denominator = d1 * d2;
  return reduceFraction(numerator, denominator);
}


function decodeValue(valueStr, baseStr) {
  const base = BigInt(baseStr);
  let result = 0n;

  for (const ch of valueStr.toLowerCase()) {
    let digit;
    if (ch >= '0' && ch <= '9') {
      digit = BigInt(ch.charCodeAt(0) - '0'.charCodeAt(0));
    } else {
      
      digit = BigInt(ch.charCodeAt(0) - 'a'.charCodeAt(0) + 10);
    }
    result = result * base + digit;
  }
  return result;
}


function interpolateConstant(points) {
  
  let accumulatedFrac = [0n, 1n];
  const totalPoints = points.length;

  for (let i = 0; i < totalPoints; i++) {
    const xi = BigInt(points[i].x);
    const yi = points[i].y;

    let numerator = 1n;
    let denominator = 1n;

    
    for (let j = 0; j < totalPoints; j++) {
      if (j === i) continue;
      const xj = BigInt(points[j].x);
      numerator *= -xj;
      denominator *= (xi - xj);
    }

    
    let termNum = yi * numerator;
    let termDen = denominator;
    [termNum, termDen] = reduceFraction(termNum, termDen);

    accumulatedFrac = addFractions(accumulatedFrac, [termNum, termDen]);
  }

  
  accumulatedFrac = reduceFraction(accumulatedFrac[0], accumulatedFrac[1]);

  
  if (accumulatedFrac[1] !== 1n) {
    throw new Error('Interpolation did not result in an integer constant term!');
  }

  return accumulatedFrac[0];
}


function main() {
  
  const inputFile = process.argv[2] || 'input.json';

  
  let testCases;
  try {
    const fileData = fs.readFileSync(inputFile, 'utf8').trim();
    const parsed = JSON.parse(fileData);

    
    if (Array.isArray(parsed)) {
      testCases = parsed;
    } else if (typeof parsed === 'object' && parsed !== null && parsed.keys) {
      testCases = [parsed];
    } else {
      throw new Error('JSON does not appear to be a valid test case or array of test cases.');
    }
  } catch (err) {
    console.error('Could not parse the JSON input:', err.message);
    process.exit(1);
  }

  const secrets = [];

  
  for (const testCase of testCases) {
    
    if (!testCase.keys || testCase.keys.k === undefined || testCase.keys.n === undefined) {
      console.error("Skipping a test case because it's missing 'keys' with 'n' and 'k'.");
      continue;
    }

    
    const n = parseInt(testCase.keys.n, 10);
    const k = parseInt(testCase.keys.k, 10);

    
    const pointKeys = Object.keys(testCase).filter(k => k !== 'keys');
    
    pointKeys.sort((a, b) => Number(a) - Number(b));

    
    const chosenKeys = pointKeys.slice(0, k);

    
    const points = [];
    for (const xKey of chosenKeys) {
      const { base, value } = testCase[xKey];
      const xCoord = Number(xKey);
      const yCoord = decodeValue(value, base);
      points.push({ x: xCoord, y: yCoord });
    }
    const secret = interpolateConstant(points);
    secrets.push(secret.toString());
  }

  console.log(secrets.join('\n'));
}

main();
