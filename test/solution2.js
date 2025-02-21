// Save this code (for example as solution.js) and run with Node.js.
// It expects an input JSON file (default name "input.json").
// The JSON file may contain either a single test case or an array of test case objects.

const fs = require('fs');

// --- Helper functions for fraction arithmetic using BigInt ---

// Compute the greatest common divisor of two BigInts
function gcd(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    return b === 0n ? a : gcd(b, a % b);
}

// Reduce the fraction (n/d) to its simplest form.
// Ensures that the denominator is positive.
function reduceFraction(n, d) {
    if (d < 0n) {
        n = -n;
        d = -d;
    }
    const g = gcd(n < 0n ? -n : n, d);
    if (g !== 0n) {
        n /= g;
        d /= g;
    }
    return [n, d];
}

// Add two fractions represented as [numerator, denominator]
function addFractions(frac1, frac2) {
    const [n1, d1] = frac1;
    const [n2, d2] = frac2;
    const numerator = n1 * d2 + n2 * d1;
    const denominator = d1 * d2;
    return reduceFraction(numerator, denominator);
}

// --- Utility to decode a string value from a given base ---
function decodeValue(valueStr, baseStr) {
    const base = BigInt(baseStr);
    let result = 0n;
    for (const char of valueStr) {
        let digit;
        if (char >= '0' && char <= '9') {
            digit = BigInt(char.charCodeAt(0) - '0'.charCodeAt(0));
        } else {
            // For letters: 'a' -> 10, 'b' -> 11, etc.
            digit = BigInt(char.charCodeAt(0) - 'a'.charCodeAt(0) + 10);
        }
        result = result * base + digit;
    }
    return result;
}

// --- Lagrange interpolation at x = 0 ---
// Given an array of points {x, y} (with x as Number and y as BigInt),
// compute the constant term f(0) using the formula:
//   f(0) = Σ [ y_i * (∏_{j ≠ i} (-x_j)) / (∏_{j ≠ i} (x_i - x_j)) ]
function interpolateConstant(points) {
    const k = points.length;
    // Represent f(0) as a fraction [num, den]
    let secretFraction = [0n, 1n];

    for (let i = 0; i < k; i++) {
        const xi = BigInt(points[i].x);
        const yi = points[i].y;
        let num = 1n;
        let den = 1n;
        // Compute the product for j != i
        for (let j = 0; j < k; j++) {
            if (j === i) continue;
            const xj = BigInt(points[j].x);
            num *= -xj; // numerator: ∏_{j≠i} (-x_j)
            den *= (xi - xj); // denominator: ∏_{j≠i} (x_i - x_j)
        }
        // Term = yi * (num / den)
        let termNum = yi * num;
        let termDen = den;
        [termNum, termDen] = reduceFraction(termNum, termDen);
        secretFraction = addFractions(secretFraction, [termNum, termDen]);
    }
    secretFraction = reduceFraction(secretFraction[0], secretFraction[1]);
    // Since f(0) (i.e. the constant term) is an integer, the denominator must be 1.
    if (secretFraction[1] !== 1n) {
        throw new Error("Non-integer constant computed.");
    }
    return secretFraction[0];
}

// --- Main function ---
// Reads the JSON file, processes one or more test cases,
// and prints the constant term (secret) for each.
function main() {
    // Read input from file specified as first command-line argument, or default to "input.json"
    const inputFile = process.argv[2] || 'input2.json';
    const content = fs.readFileSync(inputFile, 'utf8').trim();
    let testCases;
    try {
        const parsed = JSON.parse(content);
        // Allow input to be either a single test case object or an array of test cases.
        if (Array.isArray(parsed)) {
            testCases = parsed;
        } else if (typeof parsed === 'object' && parsed !== null && parsed.keys) {
            testCases = [parsed];
        } else {
            throw new Error("Invalid test case structure.");
        }
    } catch (e) {
        console.error("Error parsing JSON input:", e.message);
        process.exit(1);
    }

    const secrets = [];

    // Process each test case
    for (const testCase of testCases) {
        if (!testCase.keys || testCase.keys.k === undefined || testCase.keys.n === undefined) {
            console.error("Test case missing 'keys' information.");
            continue;
        }
        const n = parseInt(testCase.keys.n, 10);
        const k = parseInt(testCase.keys.k, 10);
        // Gather all keys (except the "keys" object) which represent points.
        const pointKeys = Object.keys(testCase).filter(key => key !== 'keys');
        // Sort keys numerically (they represent the x coordinate)
        pointKeys.sort((a, b) => Number(a) - Number(b));
        // Use the first k points (since k = m + 1 is the minimum required)
        const chosenKeys = pointKeys.slice(0, k);
        const points = [];
        for (const key of chosenKeys) {
            const point = testCase[key];
            // x coordinate is the key converted to Number
            const x = Number(key);
            // y value: decode using the provided base (both "base" and "value" are strings)
            const y = decodeValue(point.value, point.base);
            points.push({ x, y });
        }
        // Compute secret constant f(0)
        const secret = interpolateConstant(points);
        secrets.push(secret.toString());
    }
    // Print all secrets (one per test case) simultaneously
    console.log(secrets.join('\n'));
}

main();
