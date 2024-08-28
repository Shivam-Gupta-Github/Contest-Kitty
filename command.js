import { REST, Routes } from "discord.js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const commands = [
  {
    name: "contests",
    description: "Replies with upcoming Codeforces contests",
  },
  {
    name: "help",
    description:
      "Replies with a list of available commands and their descriptions.",
  },
  {
    name: "about",
    description: "Learn more about this bot.",
  },
  {
    name: "codeforces-last-contest",
    description: "Compare the last Codeforces contest performance of users",
    options: [
      {
        name: "handles",
        type: 3, // STRING type
        description: "Space-separated Codeforces handles",
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
