async function verifyGeminiAccess({ client, config }) {
  const models = [config.textModel, config.imageModel];
  const verifiedModels = [];

  for (const model of models) {
    const info = await client.models.get({ model });
    verifiedModels.push(info.name || model);
  }

  return verifiedModels;
}

module.exports = {
  verifyGeminiAccess,
};
