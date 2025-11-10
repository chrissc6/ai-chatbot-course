export type LimitGroup = {
  total: number;
  inputs: number;
  outputs: number;
};

export type ChatLimits = {
  messages: LimitGroup;
  tokens: LimitGroup;
};

const DEFAULT_LIMITS: ChatLimits = {
  messages: {
    total: 20,
    inputs: 10,
    outputs: 10,
  },
  tokens: {
    total: 50,
    inputs: 25,
    outputs: 25,
  },
};

const MODEL_LIMITS: Record<string, ChatLimits> = {
  "gpt-3.5-turbo": DEFAULT_LIMITS,
  "gpt-4o-mini": {
    messages: {
      total: 30,
      inputs: 15,
      outputs: 15,
    },
    tokens: {
      total: 200,
      inputs: 100,
      outputs: 100,
    },
  },
};

export function getChatLimits(model: string = "gpt-3.5-turbo"): ChatLimits {
  return MODEL_LIMITS[model] ?? DEFAULT_LIMITS;
}
