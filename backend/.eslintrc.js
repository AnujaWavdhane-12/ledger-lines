module.exports = {
    "ignorePatterns": [
        "**/models/**/*",
        "src/handlers/DefaultApi.interfaces.ts",
        "src/handlers/DefaultApi.ts"
    ],
    "env": {
        "browser": true,
        "es2021": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/array-type": ["error", { "default": "array" }],
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-unused-vars": ["error", { "args": "none" }],
        "no-case-declarations": "off",
    }
};
