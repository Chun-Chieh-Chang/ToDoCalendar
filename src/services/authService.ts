import { supabase } from './supabase';

export const authService = {
  async signInWithGoogle() {
    if (!supabase) return { error: new Error('Supabase not initialized') };

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/ToDoCalendar/',
        skipBrowserRedirect: true // We will handle redirect manually to escape frames
      }
    });

    if (data?.url) {
      // Force redirection on the top-level window
      window.top!.location.href = data.url;
    }

    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback: (event: any, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
