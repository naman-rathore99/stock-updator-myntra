export function createStyleRange({ start, end, name, colors, skuPattern }, existingStyles, usedCodes, sizes) {
  const from = Number(start);
  const to = Number(end);
  const itemName = name.trim();
  const colorNames = colors.split(',').map((color) => color.trim()).filter(Boolean);
  const pattern = skuPattern.trim();
  const placeholders = ['{style}', '{color}', '{size}'];
  const malformedPattern = !placeholders.every((placeholder) => pattern.includes(placeholder)) ||
    /[{},"\r\n]/.test(pattern.replaceAll('{style}', '').replaceAll('{color}', '').replaceAll('{size}', ''));

  if (!/^\d{1,10}$/.test(start) || !/^\d{1,10}$/.test(end) ||
    !Number.isSafeInteger(from) || !Number.isSafeInteger(to) || from < 0 || to < from || to - from + 1 > 500) {
    throw new Error('Enter a valid numeric range of up to 500 styles.');
  }
  if (!itemName || itemName.length > 80) throw new Error('Enter an item name (up to 80 characters).');
  if (!colorNames.length || colorNames.length > 20 || colorNames.some((color) => /[{},"\r\n]/.test(color)) ||
    new Set(colorNames.map((color) => color.toLowerCase())).size !== colorNames.length) {
    throw new Error('Enter 1–20 unique colors separated by commas.');
  }
  if (malformedPattern || pattern.length > 120) {
    throw new Error('Use each {style}, {color}, and {size} placeholder in your SKU pattern.');
  }

  const availableCodes = new Set(usedCodes);
  const catalog = {};
  const names = {};
  let firstStyle = '';
  for (let number = from; number <= to; number++) {
    const style = String(number);
    if (existingStyles[style]) continue;
    catalog[style] = colorNames.map((color) => {
      const colorCode = color.toUpperCase().replace(/\s+/g, '-');
      const items = sizes.map((size) => {
        const code = pattern.replaceAll('{style}', style).replaceAll('{color}', colorCode).replaceAll('{size}', size);
        if (/[,"\r\n]/.test(code) || availableCodes.has(code.toLowerCase())) return null;
        availableCodes.add(code.toLowerCase());
        return [code, null];
      });
      if (items.some((item) => !item)) throw new Error('The SKU pattern creates an invalid or duplicate code. Change the pattern before creating styles.');
      return [color, items];
    });
    names[style] = itemName;
    if (!firstStyle) firstStyle = style;
  }
  if (!firstStyle) throw new Error('All styles in this range already exist. Choose a range with new style numbers.');
  return { catalog, names, firstStyle };
}
