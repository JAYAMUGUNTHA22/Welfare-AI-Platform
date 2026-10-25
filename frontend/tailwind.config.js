/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F9FF', 100: '#E0F2FE', 200: '#BAE6FD', 300: '#7DD3FC',
          400: '#38BDF8', 500: '#0EA5E9', 600: '#0284C7', 700: '#0369A1',
          800: '#075985', 900: '#0C4A6E', 950: '#082F49',
        },
        navy: {
          50: '#F4F9FD', 100: '#EAF2F9', 200: '#D6E4F0', 300: '#B5C9DC',
          400: '#8BA5BE', 500: '#647F99', 600: '#49647F', 700: '#344F6B',
          800: '#243F5A', 900: '#18324D', 950: '#10263D',
        },
        accent: {
          50: '#F0F9FF', 100: '#E0F2FE', 200: '#BAE6FD', 300: '#7DD3FC',
          400: '#38BDF8', 500: '#0EA5E9', 600: '#0284C7', 700: '#0369A1',
          800: '#075985', 900: '#0C4A6E',
        },
        success: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
          400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
          800: '#166534', 900: '#14532d',
        },
        warning: {
          50: '#FFF8E7', 100: '#FEF0C7', 200: '#FAD58A', 300: '#F59E0B',
          400: '#F59E0B', 500: '#F59E0B', 600: '#C47D08', 700: '#9A6107',
          800: '#754A06', 900: '#573604',
        },
        error: {
          50: '#FFF1F2', 100: '#FDE1E4', 200: '#F6B9C0', 300: '#DC3F4D',
          400: '#DC3F4D', 500: '#DC3F4D', 600: '#B9303D', 700: '#922530',
          800: '#701D25', 900: '#52151B',
        },
        gray: {
          50: '#F8FBFE', 100: '#F1F6FA', 200: '#E4EDF4', 300: '#D2E0EB',
          400: '#A8BBCB', 500: '#8096AA', 600: '#61788E', 700: '#4A6077',
          800: '#344B62', 900: '#20384F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 24px -14px rgb(3 105 161 / 0.18)',
        'card-hover': '0 12px 32px -14px rgb(3 105 161 / 0.26)',
        soft: '0 4px 16px 0 rgb(3 105 161 / 0.10)',
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem' },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
