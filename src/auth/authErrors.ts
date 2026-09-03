/**
 * Production Firebase Error Mapping
 */
export const getReadableAuthErrorMessage = (error: any): string => {
  // Always log original error for diagnostics
  console.error('[Firebase Auth Error]', error);

  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email.';
    case 'auth/weak-password':
      return 'Password is too weak.';
    case 'auth/network-request-failed':
      return 'Network error. Please try again.';
    case 'auth/operation-not-allowed':
      return 'Email/password login is not enabled in Firebase.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'permission-denied':
      return "You don't have permission to perform this action.";
    default:
      if (message.includes('permission-denied') || message.includes('Missing or insufficient permissions')) {
        return "You don't have permission to perform this action.";
      }
      if (message.includes('network') || message.includes('offline')) {
        return 'Network error. Please try again.';
      }
      return 'Something went wrong. Please try again.';
  }
};
