<script setup lang="ts">
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

// send messages to Chat API here
// and in the empty function below

async function handleNewMessage(message: Message) {}
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
