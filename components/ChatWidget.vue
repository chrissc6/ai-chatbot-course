<script setup lang="ts">
import { $fetch } from "ofetch";
import type { Message, User } from "@/types";
import { getChatLimits } from "@/utils/chatLimits";

const me = ref<User>({
  id: "user",
  avatar: "/avatar.png",
  name: "You",
});
const bot = ref<User>({
  id: "assistant",
  avatar: "/bot.png",
  name: "Botman",
});

const users = computed(() => [me.value, bot.value]);

const activeModel = "gpt-4o-mini";
const { messages: messageLimits, tokens: tokenLimits } =
  getChatLimits(activeModel);

const messages = ref<Message[]>([]);
const usersTyping = ref<User[]>([]);
const tokenUsage = reactive({
  total: 0,
  inputs: 0,
  outputs: 0,
});
const totalMessages = computed(() => messages.value.length);
const totalInputMessages = computed(
  () =>
    messages.value.filter((msg: Message) => msg.userId === me.value.id).length
);
const totalOutputMessages = computed(
  () =>
    messages.value.filter((msg: Message) => msg.userId === bot.value.id).length
);
const messagesExceeded = computed(
  () =>
    totalMessages.value >= messageLimits.total ||
    totalInputMessages.value >= messageLimits.inputs ||
    totalOutputMessages.value >= messageLimits.outputs
);
const tokensExceeded = computed(
  () =>
    tokenUsage.total >= tokenLimits.total ||
    tokenUsage.inputs >= tokenLimits.inputs ||
    tokenUsage.outputs >= tokenLimits.outputs
);
const chatLocked = computed(
  () => messagesExceeded.value || tokensExceeded.value
);

type ChatCompletionResponse = {
  id: string;
  choices: {
    message?: {
      content?: string | null;
    };
  }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

// send messages to Chat API here
// and in the empty function below

async function handleNewMessage(message: Message) {
  if (chatLocked.value) return;

  messages.value.push(message);

  const noRoomForAssistant =
    totalMessages.value + 1 > messageLimits.total ||
    totalOutputMessages.value + 1 > messageLimits.outputs;

  if (noRoomForAssistant) {
    return;
  }

  usersTyping.value.push(bot.value);

  const chatHistory = messages.value.map((msg: Message) => ({
    role: msg.userId === me.value.id ? "user" : "assistant",
    content: msg.text,
  }));

  const res = await $fetch<ChatCompletionResponse>("/api/ai", {
    method: "POST",
    body: {
      model: activeModel,
      messages: chatHistory,
      messageCounts: {
        total: totalMessages.value,
        inputs: totalInputMessages.value,
        outputs: totalOutputMessages.value,
      },
    },
  });

  const aiContent = res.choices[0]?.message?.content;
  if (!aiContent) {
    usersTyping.value = [];
    return;
  }

  if (res.usage) {
    tokenUsage.inputs += res.usage.prompt_tokens ?? 0;
    tokenUsage.outputs += res.usage.completion_tokens ?? 0;
    tokenUsage.total += res.usage.total_tokens ?? 0;
  }
  if (tokensExceeded.value) {
    usersTyping.value = [];
    return;
  }

  const canAddAssistantMessage =
    totalMessages.value + 1 <= messageLimits.total &&
    totalOutputMessages.value + 1 <= messageLimits.outputs &&
    !tokensExceeded.value;

  if (!canAddAssistantMessage) {
    usersTyping.value = [];
    return;
  }

  const msg: Message = {
    id: res.id,
    userId: bot.value.id,
    createdAt: new Date(),
    text: aiContent,
  };
  messages.value.push(msg);
  usersTyping.value = [];
}
</script>
<template>
  <ChatBox
    :me="me"
    :users="users"
    :messages="messages"
    @new-message="handleNewMessage"
    :usersTyping="usersTyping"
    :chatLocked="chatLocked"
  />
</template>
