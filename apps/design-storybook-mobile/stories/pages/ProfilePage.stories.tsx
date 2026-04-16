import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import {
  NScreen,
  NHeader,
  NText,
  NAvatar,
  NBadge,
  NCard,
  NDivider,
  NButton,
} from '@imjohnkoo/design-mobile'

function ProfilePage() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <NHeader title="프로필" rightIcon={<NText>⚙️</NText>} />

      <NScreen scroll padding>
        {/* Profile header */}
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <NAvatar size="xl" src="https://i.pravatar.cc/150?u=john" />
          <NText variant="h3" style={{ marginTop: 12 }}>김민수</NText>
          <NText variant="bodySmall" color="#737373">@minsu.kim</NText>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <NBadge label="개발자" color="primary" variant="subtle" />
            <NBadge label="PRO" color="success" variant="solid" size="sm" />
          </View>
        </View>

        {/* Stats */}
        <NCard variant="filled" padding="md">
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <NText variant="h3">128</NText>
              <NText variant="caption" color="#737373">게시물</NText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <NText variant="h3">1.2K</NText>
              <NText variant="caption" color="#737373">팔로워</NText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <NText variant="h3">340</NText>
              <NText variant="caption" color="#737373">팔로잉</NText>
            </View>
          </View>
        </NCard>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <View style={{ flex: 1 }}>
            <NButton fullWidth onPress={() => {}}>메시지</NButton>
          </View>
          <View style={{ flex: 1 }}>
            <NButton variant="outline" fullWidth onPress={() => {}}>팔로우</NButton>
          </View>
        </View>

        <NDivider />

        {/* Info list */}
        <NCard variant="outlined" padding="md">
          <View style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <NText variant="bodySmall" color="#737373">이메일</NText>
              <NText variant="bodySmall">minsu@nomacom.co</NText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <NText variant="bodySmall" color="#737373">위치</NText>
              <NText variant="bodySmall">서울, 대한민국</NText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <NText variant="bodySmall" color="#737373">가입일</NText>
              <NText variant="bodySmall">2024년 3월</NText>
            </View>
          </View>
        </NCard>
      </NScreen>
    </View>
  )
}

const meta = {
  title: 'Pages/프로필',
  component: ProfilePage,
  parameters: {
    padding: false,
  },
} satisfies Meta<typeof ProfilePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
