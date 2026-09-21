// A bounded arithmetic grammar. User input is never executed as JavaScript.
export function evaluateExpression(input, degrees = true) {
  if (!input?.trim()) return null;
  try {
    const text = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\*\*/g, '^');
    if (text.length > 2000) return null;
    const tokens = text.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[a-z]+|π|[()+\-*/^!%]|\S/g) || [];
    if (tokens.length > 200) return null;
    let index = 0;
    const rad = x => degrees ? x * Math.PI / 180 : x;
    const angle = x => degrees ? x * 180 / Math.PI : x;
    const factorial = n => {
      if (!Number.isInteger(n) || n < 0 || n > 170) throw new Error('Invalid factorial');
      let result = 1;
      for (let i = 2; i <= n; i++) result *= i;
      return result;
    };
    const functions = {
      sin: x => Math.sin(rad(x)), cos: x => Math.cos(rad(x)), tan: x => Math.tan(rad(x)),
      asin: x => angle(Math.asin(x)), acos: x => angle(Math.acos(x)), atan: x => angle(Math.atan(x)),
      sqrt: Math.sqrt, cbrt: Math.cbrt, log: Math.log10, ln: Math.log, abs: Math.abs, exp: Math.exp, fact: factorial,
    };
    const take = token => tokens[index] === token ? (++index, true) : false;
    const expect = token => { if (!take(token)) throw new Error('Invalid expression'); };
    function primary() {
      const token = tokens[index++];
      if (token === '(') { const value = sum(); expect(')'); return value; }
      if (token === 'π' || token === 'pi') return Math.PI;
      if (token === 'e') return Math.E;
      if (Object.hasOwn(functions, token)) { expect('('); const value = sum(); expect(')'); return functions[token](value); }
      if (!token || !/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(token)) throw new Error('Invalid number');
      return Number(token);
    }
    function power() {
      let value = primary();
      while (tokens[index] === '!' || tokens[index] === '%') value = tokens[index++] === '!' ? factorial(value) : value / 100;
      if (take('^')) value **= unary();
      return value;
    }
    function unary() { return take('+') ? unary() : take('-') ? -unary() : power(); }
    function product() {
      let value = unary();
      while (tokens[index] === '*' || tokens[index] === '/') value = tokens[index++] === '*' ? value * unary() : value / unary();
      return value;
    }
    function sum() {
      let value = product();
      while (tokens[index] === '+' || tokens[index] === '-') value = tokens[index++] === '+' ? value + product() : value - product();
      return value;
    }
    const result = sum();
    return index === tokens.length && Number.isFinite(result) ? Number(result.toPrecision(15)) : null;
  } catch { return null; }
}
