import { SABnzbd } from "../src";

const sabnzb = new SABnzbd(process.env.HOST, process.env.PORT, process.env.API_KEY);

test('should return the correct version', async () => {
  const version = await sabnzb.version();
  expect(version).toBe("3.2.0");
});

test("should return the id of correct added file", async () => {
  const ids = await sabnzb.addURL("https://animetosho.org/storage/nzbs/00066901/%5BSSA%5D%20Tenchi%20Souzou%20Design-bu%20-%2013%20%5B480p%5D.nzb.gz");
  expect(ids).toHaveLength(1);
});
test("should return the correct queue", async () => {
  jest.setTimeout(30000);
  await sabnzb.addURL("https://animetosho.org/storage/nzbs/00066901/%5BSSA%5D%20Tenchi%20Souzou%20Design-bu%20-%2013%20%5B480p%5D.nzb.gz");
  await new Promise(resolve => setTimeout(resolve, 2000));
  const queue = await sabnzb.queue();
  expect(queue.status).toBe("Downloading");
});
test("should wait until finish", async () => {
  jest.setTimeout(30000);
  await sabnzb.addFileAndWaitTillFinish("https://animetosho.org/storage/nzbs/000668fe/%5BSSA%5D%20Tenchi%20Souzou%20Design-bu%20-%2013%20%5B720p%5D.nzb.gz");
  const queue = await sabnzb.queue();
  expect(queue.status).toBe("Idle");
});
test("should return the correct history", async () => {
  jest.setTimeout(30000);
  const ids = await sabnzb.addFileAndWaitTillFinish("https://animetosho.org/storage/nzbs/000668fe/%5BSSA%5D%20Tenchi%20Souzou%20Design-bu%20-%2013%20%5B720p%5D.nzb.gz");
  const history = await sabnzb.history(ids);
  expect(history.slots).toHaveLength(1);
  expect(history.slots[0].status).toBe("Completed")
});
