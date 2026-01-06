import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "simple-import-sort/imports": [
        "error",
        {
          "groups": [
            // React
            ["^react$", "^next", "^next/"],
            // Other libraries (excluding internal modules)
            ["^(?!acl|actions|app|assets|components|constants|contexts|gql|utils|next|@mui)(@?\\w)"],
            // MUI
            ["^@mui/material", "^@mui/icons-material", "^@mui/"],
            // Internal modules
            ["^(acl|contexts|gql)(/|$)"],
            ["^(app|components|utils)(/|$)"],
            ["^(actions|assets|constants)(/|$)"],
            // Relative imports
            ["^\\."],
            // Side effect imports
            ["^\\u0000"]
          ]
        }
      ],
      "simple-import-sort/exports": "error",
    },
  },
];

export default eslintConfig;
