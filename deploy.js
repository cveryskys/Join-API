import express from "express";
import dotenv from "dotenv";
import noblox from "noblox.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

let loggedIn = false;

const init = async () => {
  try {
    await noblox.setCookie(process.env.ROBLOX_COOKIE);
    const currentUser = await noblox.getCurrentUser();
    console.log(`Logged ${currentUser.UserName}`);
    loggedIn = true;
  } catch (err) {
    console.error("Failed", err.message);
  }
};

app.get("/api/get-join-data/:username", async (req, res) => {
  if (!loggedIn) return res.status(503).json({ error: "Bot not authenticated." });

  const { username } = req.params;
  try {
    const user = await noblox.getIdFromUsername(username);
    const presence = await noblox.getPlayerInfo(user);

    const [details] = await noblox.getPlayerPresences([user]);

    if (details && details.userPresenceType === 2) {
      res.json({
        placeId: details.lastLocation.placeId,
        jobId: details.lastLocation.gameId,
        username: username
      });
    } else {
      res.status(404).json({ error: "User is not in a joinable game." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data.", message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Listening http://localhost:${PORT}`);
  init();
});