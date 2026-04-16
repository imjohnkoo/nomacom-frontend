<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(false)

function handleLogin() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-(--ui-bg) px-4">
    <div class="w-full max-w-sm space-y-8">
      <!-- Logo -->
      <div class="text-center">
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Nomacom</h1>
        <p class="text-sm text-(--ui-text-muted) mt-2">계정에 로그인하세요</p>
      </div>

      <!-- Form -->
      <UCard>
        <div class="space-y-4">
          <UFormField label="이메일">
            <UInput
              v-model="email"
              type="email"
              placeholder="email@nomacom.io"
              icon="i-lucide-mail"
            />
          </UFormField>

          <UFormField label="비밀번호">
            <UInput
              v-model="password"
              type="password"
              placeholder="비밀번호 입력"
              icon="i-lucide-lock"
            />
          </UFormField>

          <div class="flex items-center justify-between">
            <UCheckbox v-model="remember" label="로그인 유지" />
            <UButton label="비밀번호 찾기" variant="link" size="sm" />
          </div>

          <UButton label="로그인" block @click="handleLogin" />
        </div>

        <USeparator label="또는" class="my-4" />

        <div class="space-y-2">
          <UButton
            label="Google로 계속하기"
            icon="i-lucide-chrome"
            variant="outline"
            color="neutral"
            block
          />
          <UButton
            label="GitHub로 계속하기"
            icon="i-lucide-github"
            variant="outline"
            color="neutral"
            block
          />
        </div>
      </UCard>

      <p class="text-center text-sm text-(--ui-text-muted)">
        계정이 없으신가요?
        <UButton label="회원가입" variant="link" size="sm" />
      </p>
    </div>
  </div>
</template>
