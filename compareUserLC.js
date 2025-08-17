import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function padRight(str, width) {
  return str.padEnd(width, " "); // Pad with spaces
}

async function getRoast(user1Data, user2Data) {
  let prompt =
    "Create a light-hearted and playful roast in approximately 100 words comparing the LeetCode profiles of two users.  The roast should focus on the user with the weaker profile, but avoid being mean-spirited or discouraging.  The goal is to be humorous, entertaining, and hurtful.  Base the roast on the following JSON data, which represents the LeetCode profiles of two users: \n \n";
  prompt += JSON.stringify(user1Data, null, 2) + "\n";
  prompt += JSON.stringify(user2Data, null, 2) + "\n";

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function getLeetCodeUserStats(handle) {
  try {
    const response = await axios.get(
      `https://competeapi.vercel.app/user/leetcode/${handle}/`
    );
    const userData = response.data.data;

    if (!userData || !userData.matchedUser) {
      console.error(`Invalid or missing data for ${handle}`);
      return null; // Return null for invalid data
    }

    const user = userData.matchedUser;
    const ranking = userData.userContestRanking;

    return {
      username: user.username,
      userAvatar: user.profile.userAvatar,
      problemSolved:
        user.submitStats.acSubmissionNum.find(
          (item) => item.difficulty === "All"
        )?.count || 0, // Handle potential missing "All"
      streak: user.userCalendar.streak,
      totalActiveDays: user.userCalendar.totalActiveDays,
      attendedContestCount: ranking?.attendedContestsCount || 0, // Handle missing ranking
      rating: Math.round(ranking?.rating) || 0, // Handle missing ranking
      badgesCount: user.badges.length,
    };
  } catch (error) {
    console.error(`Error fetching data for ${handle}:`, error);
    return null;
  }
}

async function getComparison(user1, user2) {
  const user1Data = await getLeetCodeUserStats(user1);
  const user2Data = await getLeetCodeUserStats(user2);
  const COLUMN_WIDTH = 25; // Fixed width for each column
  const TOTAL_WIDTH = COLUMN_WIDTH * 2 + 20; // Total width including dividers

  const border = `+${"-".repeat(TOTAL_WIDTH)}+`;

  const formatRow = (label, val1, val2) => {
    return `| ${label.padEnd(12)} | ${val1.padEnd(
      COLUMN_WIDTH
    )} | ${val2.padEnd(COLUMN_WIDTH)} |`;
  };

  let comparisonText = `
  \`\`\`
  ${border}
  ${formatRow("", user1Data.username, user2Data.username)}
  |--------------|${"-".repeat(COLUMN_WIDTH + 2)}|${"-".repeat(
    COLUMN_WIDTH + 2
  )}|
  ${formatRow(
    "Rating",
    user1Data.rating.toString(),
    user2Data.rating.toString()
  )}
  ${formatRow(
    "Solved",
    user1Data.problemSolved.toString(),
    user2Data.problemSolved.toString()
  )}
  ${formatRow(
    "Streak",
    user1Data.streak.toString(),
    user2Data.streak.toString()
  )}
  ${formatRow(
    "Contests",
    user1Data.attendedContestCount.toString(),
    user2Data.attendedContestCount.toString()
  )}
  ${formatRow(
    "Badges",
    user1Data.badgesCount.toString(),
    user2Data.badgesCount.toString()
  )}
  ${border}
  \`\`\`
  `;

  const roast = await getRoast(user1Data, user2Data);
  if (roast) {
    comparisonText += roast;
  }
  return comparisonText;
}

export default getComparison;
