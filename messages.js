function getHelpMessage() {
  const helpMessage = `
  **Contest Kitty - Command List**

  \`/contests\` - Replies with upcoming Codeforces contests.

  \`/codeforces-last-contest [handles]\` - Compare the last Codeforces contest performance of users. Provide space-separated Codeforces handles.

  \`/help\` - Replies with a list of available commands and their descriptions.

  \`/about\` - Learn more about this bot and its author.

  Use the commands above to get the most out of Contest Kitty!
    `;
  return helpMessage;
}

function getAboutMessage() {
  const aboutMessage = `
      **About Contest Kitty**
Contest Kitty is a helpful Discord bot designed to keep you updated with upcoming coding contests and allow you to compare your Codeforces contest performance with others.

      **Author:**
      Shivam Gupta.
      **Linkedin:**  https://www.linkedin.com/in/cse-shivam-gupta/
      **Linkedin:**  https://leetcode.com/u/CS_2201640100272/
      **Contact:** shivamgupta35967@gmail.com
        `;
  return aboutMessage;
}

export { getHelpMessage, getAboutMessage };
