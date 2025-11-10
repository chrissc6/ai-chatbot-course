import {
  Configuration,
  OpenAIApi,
  type ChatCompletionRequestMessage,
} from "openai";
import { getChatLimits } from "@/utils/chatLimits";

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
    model?: string;
    messages?: ChatCompletionRequestMessage[];
    temperature?: number;
    messageCounts?: {
      total: number;
      inputs: number;
      outputs: number;
    };
  }>(event);

  const model = body?.model ?? "gpt-4o-mini";
  const { tokens: tokenLimits, messages: messageLimits } = getChatLimits(model);

  const completion = await openai.createChatCompletion({
    model,
    messages: body?.messages ?? [],
    temperature: body?.temperature ?? 1,
    max_tokens: tokenLimits.outputs,
  });

  console.log(completion.data.choices[0].message);
  if (body?.messageCounts) {
    console.debug("Message counts", {
      counts: body.messageCounts,
      limits: messageLimits,
    });
  }

  return completion.data;
});
