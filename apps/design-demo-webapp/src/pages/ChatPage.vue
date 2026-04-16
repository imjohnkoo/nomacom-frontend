<script setup lang="ts">
import { ref } from 'vue'

const message = ref('')
const showOptions = ref(false)

const messages = [
  { id: '1', sender: 'other', name: '이서연', text: '디자인 시스템 리뷰 가능할까요?', time: '오전 10:30' },
  { id: '2', sender: 'me', text: '네, 오후에 확인하겠습니다!', time: '오전 10:32' },
  { id: '3', sender: 'other', name: '이서연', text: 'Figma 링크 보내드릴게요', time: '오전 10:33' },
  { id: '4', sender: 'other', name: '이서연', text: '컴포넌트 변경사항 정리해두었어요. 특히 Button, Card 쪽 확인 부탁드려요.', time: '오전 10:34' },
  { id: '5', sender: 'me', text: '확인했습니다. Button variant 부분은 수정이 필요할 것 같아요', time: '오전 11:15' },
  { id: '6', sender: 'me', text: '나머지는 LGTM 👍', time: '오전 11:15' },
  { id: '7', sender: 'other', name: '이서연', text: '감사합니다! 수정 후 다시 공유드릴게요', time: '오전 11:20' },
]

function sendMessage() {
  message.value = ''
}
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-3 border-b border-(--ui-border)">
      <div class="flex items-center gap-3">
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" size="sm" @click="$router.back()" />
        <div>
          <h1 class="text-base font-bold text-(--ui-text-highlighted)">이서연</h1>
          <p class="text-xs text-green-500">온라인</p>
        </div>
      </div>
      <UButton icon="i-lucide-ellipsis" variant="ghost" color="neutral" size="sm" @click="showOptions = true" />
    </header>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto px-4 py-3">
      <!-- Date badge -->
      <div class="flex justify-center mb-4">
        <UBadge label="오늘" variant="subtle" color="neutral" size="xs" />
      </div>

      <!-- Message bubbles -->
      <div v-for="msg in messages" :key="msg.id" class="mb-2" :class="msg.sender === 'me' ? 'flex flex-col items-end' : ''">
        <!-- Sender info -->
        <div v-if="msg.sender === 'other'" class="flex items-center gap-1.5 mb-1">
          <UAvatar :text="msg.name?.slice(0, 1)" size="2xs" />
          <span class="text-xs font-semibold text-(--ui-text-highlighted)">{{ msg.name }}</span>
        </div>

        <!-- Bubble -->
        <div
          class="max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed"
          :class="[
            msg.sender === 'me'
              ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
              : 'bg-zinc-100 text-zinc-900 rounded-2xl rounded-tl-sm ml-7',
          ]"
        >
          {{ msg.text }}
        </div>

        <!-- Time -->
        <span class="text-[10px] text-zinc-400 mt-0.5" :class="msg.sender === 'other' ? 'ml-7' : ''">
          {{ msg.time }}
        </span>
      </div>

      <div class="h-4" />
    </div>

    <!-- Input area -->
    <div class="flex items-center gap-2 px-4 py-2.5 border-t border-(--ui-border) bg-white">
      <UButton icon="i-lucide-plus" variant="ghost" color="neutral" size="sm" />
      <UInput
        v-model="message"
        placeholder="메시지를 입력하세요"
        class="flex-1"
        @keyup.enter="sendMessage"
      />
      <UButton label="전송" size="sm" @click="sendMessage" />
    </div>

    <!-- Options modal -->
    <UModal v-model:open="showOptions">
      <template #content>
        <div class="p-4 space-y-2">
          <h3 class="text-base font-bold mb-3 text-(--ui-text-highlighted)">채팅 옵션</h3>
          <UButton label="알림 끄기" icon="i-lucide-bell-off" variant="ghost" color="neutral" block class="justify-start" @click="showOptions = false" />
          <UButton label="대화 검색" icon="i-lucide-search" variant="ghost" color="neutral" block class="justify-start" @click="showOptions = false" />
          <UButton label="미디어 보기" icon="i-lucide-image" variant="ghost" color="neutral" block class="justify-start" @click="showOptions = false" />
          <USeparator class="my-2" />
          <UButton label="채팅방 나가기" icon="i-lucide-log-out" variant="soft" color="error" block class="justify-start" @click="showOptions = false" />
        </div>
      </template>
    </UModal>
  </div>
</template>
