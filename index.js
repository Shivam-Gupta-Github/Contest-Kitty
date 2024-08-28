import Discord, { GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import axios from "axios";
import { getHelpMessage, getAboutMessage } from "./messages.js";
import keepAlive from "./server.js";

// Load environment variables from .env file
dotenv.config();

// Create a new client instance with required intents
const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Fetch upcoming contests from Codeforces
async function getCodeforcesContests() {
  const response = await axios.get("https://codeforces.com/api/contest.list");
  const contests = response.data.result
    .filter((contest) => contest.phase === "BEFORE")
    .map((contest) => ({
      name: contest.name,
      startTime: new Date(contest.startTimeSeconds * 1000).toLocaleString(),
    }));
  // .slice(0, 3); // Get top 3 upcoming contests
  return contests;
}

// Fetch Leetcode contests from Codeforces
async function getLeetcodeContests() {
  const response = await axios.get(
    "https://competeapi.vercel.app/contests/leetcode/",
  );
  const contests = response.data.data.topTwoContests.map((contest) => ({
    name: contest.title,
    startTime: new Date(contest.startTime * 1000).toLocaleString(),
  }));
  return contests;
}

// Fetch user rating history from Codeforces
async function getCodeforcesUserRating(handle) {
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.rating?handle=${handle}`,
    );
    return response.data.result;
  } catch (error) {
    console.error(`Error fetching data for ${handle}:`, error);
    return null;
  }
}

// Fetch the latest contest data for a user from Codeforces
async function getLastContestData(handles) {
  let resultMessage = "```\n"; // Start a code block
  resultMessage +=
    "Handle      | Contest                                 | Rank  | Rating\n";
  resultMessage +=
    "------------|-----------------------------------------|-------|--------\n";

  for (let handle of handles) {
    const ratings = await getCodeforcesUserRating(handle);
    if (ratings && ratings.length > 0) {
      const lastContest = ratings[ratings.length - 1];
      let contestName = lastContest.contestName;

      // Truncate the contest name if it exceeds 35 characters
      if (contestName.length > 35) {
        contestName = contestName.slice(0, 35) + "...";
      }

      resultMessage += `${handle.padEnd(12)}| ${contestName.padEnd(40)}| ${String(lastContest.rank).padEnd(6)}| ${lastContest.newRating}\n`;
    } else {
      resultMessage += `${handle.padEnd(12)}| No contest data available.\n`;
    }
  }

  resultMessage += "```"; // End the code block
  return resultMessage;
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "help") {
    await interaction.reply(getHelpMessage());
  }

  if (interaction.commandName === "about") {
    await interaction.reply(getAboutMessage());
  }

  if (interaction.commandName === "codeforces-last-contest") {
    const handles = interaction.options.getString("handles").split(" ");
    const resultMessage = await getLastContestData(handles);
    await interaction.reply(resultMessage);
  }

  if (interaction.commandName === "contests") {
    const codeforcesContests = await getCodeforcesContests();
    const leetcodeContests = await getLeetcodeContests();

    let message = "```\n";
    message += "Upcoming Contests:\n\n";
    message +=
      "Platform    | Contest Name                             | Start Time\n";
    message +=
      "------------|------------------------------------------|----------------------\n";

    codeforcesContests.forEach((contest) => {
      message += `Codeforces  | ${contest.name.padEnd(40)} | ${contest.startTime}\n`;
    });

    leetcodeContests.forEach((contest) => {
      message += `LeetCode    | ${contest.name.padEnd(40)} | ${contest.startTime}\n`;
    });

    message += "```";

    await interaction.reply(message);
  }
});

keepAlive();
client.login(process.env.TOKEN);
