const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        aurora: "aurora 60s linear infinite",
        float: "float 20s linear infinite",
        enter: "enter 0.3s ease-out",
        leave: "leave 0.3s ease-in forwards",
        ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        aurora: {
          from: { backgroundPosition: "50% 50%, 50% 50%" },
          to: { backgroundPosition: "350% 50%, 350% 50%" },
        },
        float: {
          "0%": { strokeDashoffset: "0" },
          "100%": { strokeDashoffset: "1000" },
        },
        enter: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        leave: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        ping: {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-glassmorphism': 'linear-gradient(to right bottom, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.3))',
        'gradient-glassmorphism-dark': 'linear-gradient(to right bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3))',
        'curved-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'%3E%3Cpath d='M0,400 C300,300 600,600 1200,400' stroke='%23059669' stroke-width='1' fill='none' /%3E%3Cpath d='M0,500 C300,400 600,700 1200,500' stroke='%23059669' stroke-width='1' fill='none' /%3E%3Cpath d='M0,600 C300,500 600,800 1200,600' stroke='%23059669' stroke-width='1' fill='none' /%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/line-clamp'),
    addVariablesForColors,
    function({ addUtilities }) {
      addUtilities({
        '.backdrop-blur-xl': {
          backdropFilter: 'blur(24px)',
          '-webkit-backdrop-filter': 'blur(24px)'
        },
        '.backdrop-blur-lg': {
          backdropFilter: 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)'
        },
        '.backdrop-blur-md': {
          backdropFilter: 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)'
        },
        '.backdrop-blur-sm': {
          backdropFilter: 'blur(8px)',
          '-webkit-backdrop-filter': 'blur(8px)'
        },
        '.bg-glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(209, 250, 229, 0.3)'
        },
        '.bg-glass-dark': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(5, 150, 105, 0.2)'
        },
        '.text-gradient': {
          background: 'linear-gradient(to right, #059669, #10b981)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          'color': 'transparent',
          '-webkit-text-fill-color': 'transparent'
        }
      });
    }
  ],
}

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}