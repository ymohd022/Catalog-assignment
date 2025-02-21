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
    for (const c of valueStr) {
        const char = c.toLowerCase();
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
function interpolateConstant(points) {
    const k = points.length;
    let secretFraction = [0n, 1n];

    for (let i = 0; i < k; i++) {
        const xi = BigInt(points[i].x);
        const yi = points[i].y;
        let num = 1n;
        let den = 1n;
        for (let j = 0; j < k; j++) {
            if (j === i) continue;
            const xj = BigInt(points[j].x);
            num *= -xj;
            den *= (xi - xj);
        }
        let termNum = yi * num;
        let termDen = den;
        [termNum, termDen] = reduceFraction(termNum, termDen);
        secretFraction = addFractions(secretFraction, [termNum, termDen]);
    }
    secretFraction = reduceFraction(secretFraction[0], secretFraction[1]);
    if (secretFraction[1] !== 1n) {
        throw new Error("Non-integer constant computed.");
    }
    return secretFraction[0];
}

// --- Main function ---
function main() {
    const inputFile = process.argv[2] || 'input.json';
    const content = fs.readFileSync(inputFile, 'utf8').trim();
    let testCases;
    try {
        const parsed = JSON.parse(content);
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

    for (const testCase of testCases) {
        if (!testCase.keys || testCase.keys.k === undefined || testCase.keys.n === undefined) {
            console.error("Test case missing 'keys' information.");
            continue;
        }
        const n = parseInt(testCase.keys.n, 10);
        const k = parseInt(testCase.keys.k, 10);
        const pointKeys = Object.keys(testCase).filter(key => key !== 'keys');
        pointKeys.sort((a, b) => Number(a) - Number(b));
        const chosenKeys = pointKeys.slice(0, k);
        const points = [];
        for (const key of chosenKeys) {
            const point = testCase[key];
            const x = Number(key);
            const y = decodeValue(point.value, point.base);
            points.push({ x, y });
        }
        const secret = interpolateConstant(points);
        secrets.push(secret.toString());
    }
    console.log(secrets.join('\n'));
}

main();