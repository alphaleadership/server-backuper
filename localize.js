'use strict';
module.exports.l = (object, locale, variables) => {
  if (typeof object !== 'object' || object === null) return {};
  const localizedStrings = require(`./l10n/${locale}.json`);
  const fallbackLocaleStrings = require(`./l10n/${locale.split('-')[0]}.json`);
  const EnglishStrings = require('./l10n/en.json');
  variables = variables || {};
  let keys = Array.from(Object.keys(object).filter(key => {
    return typeof object[key] === 'string';
  }));
  var chosenLocale = EnglishStrings;
  const array = object.fields || [];
  if (keys.every((x) => {
      return object[x] in localizedStrings && localizedStrings[x] !== '';
    }) && array.every(x => {
      return x.value in localizedStrings && localizedStrings[x.value] !== '';
    }) && (object.footer.text in localizedStrings && localizedStrings[object.footer.text] !== '')) {
    chosenLocale = localizedStrings;
  } else if (keys.every((x) => {
      return object[x] in fallbackLocaleStrings && fallbackLocaleStrings[x] !== '';
    }) && array.every(x => {
      return x.value in fallbackLocaleStrings && fallbackLocaleStrings[x.value] !== '';
    }) && (object.footer.text in fallbackLocaleStrings && fallbackLocaleStrings[object.footer.text] !== '')) {
    chosenLocale = fallbackLocaleStrings;
  } else {
    chosenLocale = EnglishStrings;
  }
  keys.forEach(key => {
    object[key] = parseString(chosenLocale[object[key]] || object[key], variables);
  });
  object.fields = array.map(field => {
    field.value = parseString(chosenLocale[field.value] || field.value, variables);
    return field;
  });
  object.footer.text = parseString(chosenLocale[object.footer.text] || object.footer.text, variables);
  return object;
};

function parseString(string, variables) {
  variables = typeof variables === 'object' && variables ? variables : {};
  var isReadingVar = false;
  var newText = '';
  var varName = '';
  for (const character of string) {
    if (character === '{' && !isReadingVar) {
      isReadingVar = true;
      continue;
    } else if (character === '}' && isReadingVar) {
      isReadingVar = false;
      newText += variables[varName];
      continue;
    } else if (isReadingVar) {
      varName += character;
    } else {
      newText += character;
    }
  }
  return newText;
}

/* const f = (array, locale) => {
  if (typeof array !== 'object' || array === null) return [];
  const localizedStrings = require(`./l10n/${locale}.json`);
  const fallbackLocaleStrings = require(`./l10n/${locale.split('-')[0]}.json`);
  const EnglishStrings = require('./l10n/en.json');
  var chosenLocale = EnglishStrings;
  if (array.every(x => {
      return x.value in localizedStrings && localizedStrings[x.value] !== '';
    })) {
    chosenLocale = localizedStrings;
  } else if (array.every(x => {
      return x.value in fallbackLocaleStrings && fallbackLocaleStrings[x.value] !== '';
    })) {
    chosenLocale = fallbackLocaleStrings;
  } else {
    chosenLocale = EnglishStrings;
  }
};

module.exports.f = f; */
