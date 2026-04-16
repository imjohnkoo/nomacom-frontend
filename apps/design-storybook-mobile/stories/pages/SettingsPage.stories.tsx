import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import {
  NScreen,
  NHeader,
  NText,
  NAvatar,
  NSwitch,
  NCard,
  NDivider,
  NButton,
  NAlert,
} from '@imjohnkoo/design-mobile'

function SettingsPage() {
  const [pushNotif, setPushNotif] = useState(true)
  const [emailNotif, setEmailNotif] = useState(false)
  const [biometric, setBiometric] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <NHeader
        title="설정"
        leftIcon={<NText>←</NText>}
      />

      <NScreen scroll padding>
        {/* Account */}
        <NCard variant="outlined" padding="md">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <NAvatar size="lg" text="김" />
            <View style={{ flex: 1 }}>
              <NText variant="label">김민수</NText>
              <NText variant="caption" color="#737373">minsu@nomacom.co</NText>
            </View>
            <NText color="#a3a3a3">›</NText>
          </View>
        </NCard>

        {/* Notifications */}
        <NText variant="label" color="#737373" style={{ marginTop: 24, marginBottom: 8 }}>
          알림
        </NText>
        <NCard variant="outlined" padding="md">
          <View style={{ gap: 16 }}>
            <NSwitch
              value={pushNotif}
              onValueChange={setPushNotif}
              label="푸시 알림"
              description="새로운 메시지 및 업데이트 알림"
            />
            <NDivider spacing={0} />
            <NSwitch
              value={emailNotif}
              onValueChange={setEmailNotif}
              label="이메일 알림"
              description="주간 요약 및 뉴스레터"
            />
          </View>
        </NCard>

        {/* General */}
        <NText variant="label" color="#737373" style={{ marginTop: 24, marginBottom: 8 }}>
          일반
        </NText>
        <NCard variant="outlined" padding="md">
          <View style={{ gap: 16 }}>
            <NSwitch
              value={biometric}
              onValueChange={setBiometric}
              label="생체 인증"
              description="Face ID / 지문으로 로그인"
            />
            <NDivider spacing={0} />
            <NSwitch
              value={darkMode}
              onValueChange={setDarkMode}
              label="다크 모드"
              description="어두운 테마를 사용합니다"
            />
          </View>
        </NCard>

        {/* Danger zone */}
        <NText variant="label" color="#737373" style={{ marginTop: 24, marginBottom: 8 }}>
          계정
        </NText>
        <NAlert
          color="warning"
          title="계정 삭제"
          description="계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다."
        />
        <View style={{ marginTop: 12 }}>
          <NButton variant="danger" fullWidth onPress={() => {}}>계정 삭제</NButton>
        </View>

        <View style={{ height: 40 }} />
      </NScreen>
    </View>
  )
}

const meta = {
  title: 'Pages/설정',
  component: SettingsPage,
  parameters: {
    padding: false,
  },
} satisfies Meta<typeof SettingsPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
