const brand = require('./brand');

// Transforms kabeb-case string to PascalCase
function toPascalCase(name) {
  return name.charAt(0).toUpperCase() + name.replace(/-(.)?/g, (match, c) => c.toUpperCase()).slice(1);
}

module.exports = (name) => {
  const packageName = name.replace(`${brand.npmUser}/`, '');
  return toPascalCase(packageName);
};
