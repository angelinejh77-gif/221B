/* Story clock: where the story is (London time, stored as UTC ms) and the real moment it was set.
   It ticks forward in real time from setAt. Update both whenever the story jumps. */
window.STORYCLOCK = { story: Date.UTC(2026,11,28,17,35,0), setAt: Date.UTC(2026,10,7,19,37,0), label: "Mon 28 Dec, 17:35 London" };
