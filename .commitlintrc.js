// commitlint.config.js
// emojis like "✅ ", "😂 ", ...
const matchAnyEmojiWithSpaceAfter =
  /(🎨|⚡️|🔥|🐛|🚑️|✨|📝|🚀|💄|🎉|✅|🔒️|🔐|🔖|🚨|🚧|💚|⬇️|⬆️|📌|👷|📈|♻️|➕|➖|🔧|🔨|🌐|✏️|💩|⏪️|🔀|📦️|👽️|🚚|📄|💥|🍱|♿️|💡|🍻|💬|🗃️|🔊|🔇|👥|🚸|🏗️|📱|🤡|🥚|🙈|📸|⚗️|🔍️|🏷️|🌱|🚩|🥅|💫|🗑️|🛂|🩹|🧐|⚰️|🧪|👔|🩺|🧱|🧑‍💻|💸|🧵|🦺)/s;
const subjectThatDontStartWithBracket = /([^\[].+)/; // "Add tests" but don't allow "[ Add tests"

module.exports = {
  parserPreset: {
    parserOpts: {
      headerPattern: new RegExp(
        "^" +
          matchAnyEmojiWithSpaceAfter.source +
          subjectThatDontStartWithBracket.source +
          "$"
      ),
      headerCorrespondence: ["emoji", "subject"],
    },
  },
  plugins: [
    {
      rules: {
        "header-match-pattern": (parsed) => {
          const { emoji, subject } = parsed;
          if (emoji === null && subject === null) {
            return [
              false,
              `header must be in format '✅ Add tests', emoji:${emoji}, subject:${subject}`,
            ];
          }
          return [true, ""];
        },
      },
    },
  ],
  rules: {
    "header-match-pattern": [2, "always"],
  },
};
