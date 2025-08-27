export class EventHub<TEvents> {
  private readonly map = new Map<keyof TEvents, Set<Function>>();

  on<K extends keyof TEvents>(event: K, handler: TEvents[K] & ((...args: any[]) => any)): void {
    const set = this.map.get(event) ?? new Set();
    set.add(handler as unknown as Function);
    this.map.set(event, set);
  }

  off<K extends keyof TEvents>(event: K, handler: TEvents[K] & ((...args: any[]) => any)): void {
    const set = this.map.get(event);
    if (!set) return;
    set.delete(handler as unknown as Function);
    if (set.size === 0) this.map.delete(event);
  }

  emit<K extends keyof TEvents>(event: K, ...args: TEvents[K] extends (...a: infer A) => any ? A : never): void {
    const set = this.map.get(event);
    if (!set) return;
    for (const h of Array.from(set)) {
      try {
        (h as any)(...args);
      } catch { }
    }
  }

  clear(): void {
    this.map.clear();
  }
}
