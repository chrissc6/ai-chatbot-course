import {
  Configuration,
  OpenAIApi,
  type ChatCompletionRequestMessage,
} from "openai";

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

  const body = await readBody<{
    messages?: ChatCompletionRequestMessage[];
    temperature?: number;
  }>(event);

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: body?.messages ?? [],
    temperature: body?.temperature ?? 1,
  });

  console.log(completion.data.choices[0].message);

  return completion.data;
});
