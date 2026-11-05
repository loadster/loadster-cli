const ASSERTION_REGEX = /^\s*(\w+)\s*(==|>=|<=|>|<)\s*(-?(?:\d+(?:\.\d*)?|\.\d+))\s*$/;

/**
 * Parses an assertion like 'totalErrors == 0' or 'responseTimeAvg < 0.5'.
 * Throws an Error with a readable message if the assertion can't be parsed.
 */
function parseAssertion (str) {
  const parsed = String(str).match(ASSERTION_REGEX);

  if (!parsed) {
    throw new Error(`Invalid assertion '${str}'. Use the form 'metric operator number', for example 'totalErrors == 0' or 'responseTimeAvg < 0.5'. Operators are ==, >=, <=, >, and <.`);
  }

  const value = parseFloat(parsed[3]);

  if (isNaN(value)) {
    throw new Error(`Invalid assertion value '${parsed[3]}' in assertion '${str}'.`);
  }

  return {
    name: parsed[1],
    operator: parsed[2],
    value
  };
}

module.exports = { parseAssertion };
