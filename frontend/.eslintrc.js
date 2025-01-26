module.exports = {
  "root": true,
  "ignorePatterns": [
    "**/service-sdk/**/*",
    "**/assets/**/*"
  ],
  "overrides": [
    {
      "files": ["*.ts"],
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "project": ["tsconfig.json", "e2e/tsconfig.json"],
      },
      "extends": [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      "env": {
        "browser": true,
        "es2021": true
      },
      "plugins": [
        "@typescript-eslint",
        "deprecation",
        "jsdoc",
      ],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/array-type": ["error", { "default": "array" }],
        "deprecation/deprecation": "warn",
        "@typescript-eslint/member-ordering": [
          "error", 
          { 
            "default": { "memberTypes": ["static-field", "instance-field", "static-method", "instance-method"] },
          }
        ],
        "@typescript-eslint/no-unused-vars": ["error", { "args": "none" }],
        "jsdoc/no-types": 1,
        "no-restricted-imports": ["error", "rxjs/Rx"],
        "no-empty": "off",
        "no-constant-condition": "off",
        "space-before-function-paren": [
          "error",
          {
            "anonymous": "never",
            "named": "never",
            "asyncArrow": "always"
          }
        ]
      }
    }
  ]
};
