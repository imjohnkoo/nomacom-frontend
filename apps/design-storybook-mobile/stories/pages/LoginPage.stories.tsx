import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View, Text } from 'react-native'
import {
  NScreen,
  NText,
  NInput,
  NButton,
  NCheckbox,
  NDivider,
} from '@imjohnkoo/design-mobile'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  return (
    <NScreen scroll padding style={{ flex: 1 }}>
      <View style={{ paddingTop: 60, paddingBottom: 40, alignItems: 'center' }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: '#2563eb',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>N</Text>
        </View>
        <NText variant="h2">로그인</NText>
        <NText variant="bodySmall" color="#737373" style={{ marginTop: 4 }}>
          계정에 로그인하세요
        </NText>
      </View>

      <View style={{ gap: 16 }}>
        <NInput
          label="이메일"
          placeholder="이메일을 입력하세요"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <NInput
          label="비밀번호"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <NCheckbox checked={remember} onToggle={setRemember} label="로그인 유지" />
          <NText variant="bodySmall" color="#2563eb">비밀번호 찾기</NText>
        </View>

        <NButton fullWidth onPress={() => {}}>로그인</NButton>
      </View>

      <NDivider label="또는" />

      <View style={{ gap: 10 }}>
        <NButton variant="outline" fullWidth onPress={() => {}}>Google로 계속하기</NButton>
        <NButton variant="outline" fullWidth onPress={() => {}}>Apple로 계속하기</NButton>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 4 }}>
        <NText variant="bodySmall" color="#737373">계정이 없으신가요?</NText>
        <NText variant="bodySmall" color="#2563eb" weight="semibold">회원가입</NText>
      </View>
    </NScreen>
  )
}

const meta = {
  title: 'Pages/로그인',
  component: LoginPage,
  parameters: {
    padding: false,
  },
} satisfies Meta<typeof LoginPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
