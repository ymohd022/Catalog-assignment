# Catalog-assignment


This project implements a simplified version of Shamir's Secret Sharing algorithm. The goal is to compute the secret constant (the constant term 
𝑐
c) of an unknown polynomial given some encoded roots. The program reads test cases from JSON files, decodes the provided y–values (which are encoded in various bases), and uses Lagrange interpolation to determine the constant term.

Project Overview
The solution is written in JavaScript (Node.js) and is designed to handle very large numbers (up to 256-bit) by leveraging BigInt and custom fraction arithmetic. The code works by:

Reading Input: Accepting JSON input from files (input.json and input.json2).
Decoding Values: Converting encoded y–values from their given bases into BigInt numbers.
Interpolation: Applying Lagrange interpolation at 
𝑥
=
0
x=0 to compute the secret constant 
𝑐
c.
Output: Printing the computed secret for each test case.
Repository Structure
graphql

.
├── solution.js       # Main solution file
├── input.json        # Sample test case file 1
├── input2.json       # Sample test case file 2
└── README.md         # This file
Prerequisites
Node.js (version 12 or later)
How to Run
Clone the repository:

git clone https://github.com/ymohd022/Catalog-assignmen
cd your_repo
Ensure your input files (input.json and input.json2) are in the repository directory.

Run the solution:

To run with the first test case:

node solution.js input.json
To run with the second test case:


node solution.js input2.json
The program will output the computed secret constant(s) to the console.

Input File Format
Each JSON input file follows this structure:

A keys object containing:
"n": Total number of provided roots.
"k": Minimum number of roots required (where 
𝑘
=
𝑚
+
1
k=m+1, and 
𝑚
m is the degree of the polynomial).
Additional keys (other than keys) represent the roots. The key itself is the x-coordinate and its value is an object with:
"base": The numeral system in which the y–value is encoded.
"value": The encoded y–value.
Example
json
Copy
Edit
{
  "keys": { 
      "n": 4, 
      "k": 3 
  },
  "1": { 
      "base": "10", 
      "value": "4" 
  },
  "2": { 
      "base": "2", 
      "value": "111" 
  },
  "3": { 
      "base": "10", 
      "value": "12" 
  },
  "6": { 
      "base": "4", 
      "value": "213" 
  }
}
How It Works
Decoding:
The function decodeValue() converts a string representation of a number from the given base to a BigInt.


​
 
Fraction arithmetic is handled carefully to ensure exact computation.

Contributing
If you find any issues or have improvements to suggest, please open an issue or submit a pull request. Contributions are always welcome!

License
This project is licensed under the MIT License.

