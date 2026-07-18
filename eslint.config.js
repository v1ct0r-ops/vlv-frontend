import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Este proyecto no usa React Query/SWR: el patrón de fetching acordado
      // es `useEffect(() => { refetch() }, [refetch])` en cada hook (ver
      // docs/FLUJO-REFERENCIA.md). Esta regla del preset de React Compiler
      // marca ese patrón como error aunque el setState real ocurre async
      // dentro de refetch, no de forma síncrona en el efecto.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
