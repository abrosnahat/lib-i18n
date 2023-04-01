function getI18nText({ stringTokens, variables, translations, locale }) {
  const parsedTokens = stringTokens.map((token) => {
    if (Array.isArray(token)) {
      const [fnName, ...args] = token;
      switch (fnName) {
        case "@date":
          const [dateValue] = args;
          const date = new Date(dateValue);
          const dateFormat = new Intl.DateTimeFormat(locale, {
            dateStyle: "full",
            timeStyle: "long"
          });
          return dateFormat.format(date);

        case "@number":
          const numValue = args[0].startsWith("$")
            ? variables[args[0].slice(1)]
            : args[0];
          const formatOptions =
            args.length === 2
              ? {
                  style: "currency",
                  currency: args[1]
                }
              : {};
          const numberFormat = new Intl.NumberFormat(locale, formatOptions);
          return numberFormat.format(numValue);

        case "@plural":
          const key = args[0].slice(1);
          const number = args[1].startsWith("$")
            ? variables[args[1].slice(1)]
            : args[1];
          const pluralRules = new Intl.PluralRules(locale);
          const pluralForm = pluralRules.select(number);
          const pluralString = `${number}${translations[locale][key][pluralForm]}`;
          return pluralString;

        case "@list":
          const listFormat = new Intl.ListFormat(locale, {
            style: "long",
            type: "conjunction"
          });
          const items = args.map((item) => {
            if (item.startsWith("$")) {
              return variables[item.slice(1)];
            }
            if (item.startsWith("#")) {
              return translations[locale][item.slice(1)];
            }
            return item;
          });
          return listFormat.format(items);

        default:
          return token;
      }
    } else if (token.startsWith("#")) {
      return translations[locale][token.slice(1)];
    } else if (token.startsWith("$")) {
      return variables[token.slice(1)];
    } else {
      return token;
    }
  });

  return parsedTokens.join("");
}

console.log(
  getI18nText({
    stringTokens: ["key", " ", "$var", " ", "#translation"],
    variables: { var: 100 },
    translations: {
      "ru-RU": { translation: "тест" },
      "en-US": { translation: "test" },
      "de-DE": { translation: "prüfen" },
      "hi-IN": { translation: "परीक्षा" },
      "ar-AA": { translation: "امتحان" }
    },
    locale: "ar-AA"
  })
);

console.log(
  getI18nText({
    stringTokens: [["@number", "$var", "USD"]],
    variables: { var: 123456789.0123 },
    translations: {}
  })
);
