import { Configuration, OpenAIApi } from "openai";

export default defineEventHandler(async (event) => {
  const { openaiApiKey } = useRuntimeConfig();

  if (typeof openaiApiKey !== "string" || !openaiApiKey.length) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing OpenAI API key",
    });
  }

  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });
  const openai = new OpenAIApi(configuration);

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "Hello world" }],
  });

  console.log(completion.data.choices[0].message);

  return completion.data;
});
