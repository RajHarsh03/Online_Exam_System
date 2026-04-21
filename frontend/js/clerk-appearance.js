// Shared Clerk appearance configuration for Prashiksha
const clerkAppearance = {
  variables: {
    colorPrimary: '#006d4a',
    colorText: '#1a2e2a',
    colorTextSecondary: '#5f7370',
    colorBackground: '#ffffff',
    colorInputBackground: '#f5f7f6',
    colorInputText: '#1a2e2a',
    borderRadius: '0.75rem',
    fontFamily: '"DM Sans", "Inter", system-ui, sans-serif',
    fontSize: '0.9375rem',
    spacingUnit: '1rem',
  },
  elements: {
    rootBox: { width: '100%' },
    card: {
      boxShadow: 'none',
      border: 'none',
      padding: '0',
      background: 'transparent',
    },
    headerTitle: {
      fontSize: '1.5rem',
      fontWeight: '800',
      fontFamily: '"DM Sans", system-ui, sans-serif',
    },
    headerSubtitle: {
      fontSize: '0.875rem',
      color: '#5f7370',
    },
    socialButtonsBlockButton: {
      border: '1.5px solid #d8dfdd',
      borderRadius: '0.75rem',
      padding: '0.7rem 1rem',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    },
    dividerLine: { background: '#e5eae8' },
    dividerText: { color: '#8a9e9a', fontSize: '0.8125rem' },
    formFieldLabel: {
      fontSize: '0.8125rem',
      fontWeight: '600',
      color: '#1a2e2a',
      marginBottom: '0.35rem',
    },
    formFieldInput: {
      borderRadius: '0.75rem',
      border: '1.5px solid #d8dfdd',
      padding: '0.75rem 1rem',
      fontSize: '0.9rem',
      background: '#f8faf9',
      transition: 'border-color 0.2s ease',
    },
    formButtonPrimary: {
      backgroundColor: '#006d4a',
      borderRadius: '0.75rem',
      padding: '0.8rem 1.5rem',
      fontSize: '0.9375rem',
      fontWeight: '600',
      textTransform: 'none',
      letterSpacing: '0',
      boxShadow: '0 2px 8px rgba(0,109,74,0.25)',
      transition: 'all 0.2s ease',
    },
    footerActionLink: {
      color: '#006d4a',
      fontWeight: '600',
      fontSize: '0.875rem',
    },
    footerActionText: {
      fontSize: '0.875rem',
      color: '#5f7370',
    },
    formFieldInputShowPasswordButton: {
      color: '#5f7370',
    },
    identityPreviewEditButton: {
      color: '#006d4a',
    },
  },
};
