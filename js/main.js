/**
 * MUSHAK – BAPPA'S FESTIVAL QUEST
 * Main Application Bootstrap
 */

window.addEventListener("DOMContentLoaded", () => {
  // Initialize game instance
  const game = new FestivalGame();
  window.game = game;
  game.init();

  console.log("🌸 MUSHAK – BAPPA'S FESTIVAL QUEST Initialized Successfully!");
});
