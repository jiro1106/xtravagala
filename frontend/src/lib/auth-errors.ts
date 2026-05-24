import type { AuthError } from '@supabase/supabase-js';

/** Map a Supabase auth error to a user-facing message.
 *  Falls back to the original message if no friendlier version is known. */
export function friendlyAuthError(err: AuthError | { message: string } | null): string {
  if (!err) return '';
  const raw = err.message ?? '';
  const lower = raw.toLowerCase();

  if (lower.includes('rate limit')) {
    return 'Too many attempts recently. Please wait a few minutes and try again.';
  }
  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (lower.includes('invalid login credentials')) {
    return 'Email or password is incorrect.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email first — check your inbox for the link.';
  }
  if (lower.includes('password') && lower.includes('6 characters')) {
    return 'Password must be at least 6 characters.';
  }
  if (lower.includes('weak password') || lower.includes('weak_password')) {
    return 'That password is too weak. Use 6 or more characters with a mix of letters and numbers.';
  }
  if (lower.includes('email address') && lower.includes('invalid')) {
    return 'That email address isn’t accepted. Please try a different one.';
  }
  if (lower.includes('signup') && lower.includes('disabled')) {
    return 'New signups are temporarily disabled. Please try again later.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network error. Check your connection and try again.';
  }
  // Fallback: capitalize first letter so it reads as a sentence.
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Something went wrong. Please try again.';
}
