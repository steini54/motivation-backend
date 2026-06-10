async function verifyOpenAIAccess({ client, config }) {
  const models = [config.textModel, config.imageModel];
  const verifiedModels = [];

  for (const model of models) {
    const info = await client.models.retrieve(model);
    verifiedModels.push(info.id || model);
  }

  return verifiedModels;
}

module.exports = {
  verifyOpenAIAccess,
};
