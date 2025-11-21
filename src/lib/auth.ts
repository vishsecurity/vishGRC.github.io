import { User } from './db';

export class AuthService {
  private static currentUser: User | null = null;

  static setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  static getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }

    return null;
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static hasPermission(module: keyof User['permissions'], action: 'read' | 'write' | 'execute'): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions[module][action];
  }

  static logout() {
    this.setCurrentUser(null);
  }
}
