<script setup lang="ts">
import { $fetch } from "ofetch";
import type { Message, User } from "@/types";

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

const messages = ref<Message[]>([]);

const usersTyping = ref<User[]>([]);

type ChatCompletionResponse = {
  id: string;
  choices: {
    message?: {
      content?: string | null;
    };
  }[];
};

// send messages to Chat API here
// and in the empty function below

async function handleNewMessage(message: Message) {
  messages.value.push(message);
  usersTyping.value.push(bot.value);

  const chatHistory = messages.value.map((msg: Message) => ({
    role: msg.userId === me.value.id ? "user" : "assistant",
    content: msg.text,
  }));

  const res = await $fetch<ChatCompletionResponse>("/api/ai", {
    method: "POST",
    body: {
      messages: chatHistory,
    },
  });

  const aiContent = res.choices[0]?.message?.content;
  if (!aiContent) return;

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
  />
</template>
