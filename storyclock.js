/* Story clock: where the story is (London time, stored as UTC ms) and the real moment it was set.
   It ticks forward in real time from setAt. Update both whenever the story jumps. */
window.STORYCLOCK = { story: Date.UTC(2026,11,2,8,30,0), setAt: Date.UTC(2026,9,31,17,48,0), label: "Wed 2 Dec, 08:30 Edinburgh" };
