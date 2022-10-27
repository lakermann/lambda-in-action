const execSync = require("child_process").execSync;

// use aws cli because it is way better at syncing and there are no good js libraries that can do a s3 sync
execSync(
  "aws s3 sync dist/ s3://lambda-in-action-ui --delete --acl public-read"
);
