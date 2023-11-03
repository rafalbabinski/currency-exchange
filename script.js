/* eslint-disable no-console */
const { spawn } = require("child_process");

const serverlessCmd = "./node_modules/.bin/serverless";
const args = ["offline", "start", "-s", "local", "--httpPort", "1337", "--lambdaPort", "4000", "--reloadHandler"];

const ps = spawn(serverlessCmd, args);

ps.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

ps.stderr.on("data", (data) => {
  if (data.indexOf("Server ready") !== -1) {
    process.send?.("ready");
  }

  console.error(`stderr: ${data}`);
});

ps.on("error", (error) => {
  console.error(`Error: ${error.message}`);

  process.exit(error ? 1 : 0);
});

ps.on("close", (code) => {
  console.log(`Child process exited with code ${code}`);

  process.exit(0);
});
