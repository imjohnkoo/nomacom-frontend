import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { NBottomSheet, NButton, NText, NDivider } from '@imjohnkoo/design-mobile'

const meta = {
  title: 'Navigation/NBottomSheet',
  component: NBottomSheet,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    height: { control: 'number' },
  },
  args: { visible: false, title: '바텀 시트' },
} satisfies Meta<typeof NBottomSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [visible, setVisible] = useState(false)
    return (
      <View>
        <NButton onPress={() => setVisible(true)}>바텀 시트 열기</NButton>
        <NBottomSheet {...args} visible={visible} onClose={() => setVisible(false)}>
          <NText>바텀 시트 내용이 여기에 들어갑니다.</NText>
        </NBottomSheet>
      </View>
    )
  },
}

export const WithContent: Story = {
  render: (args) => {
    const [visible, setVisible] = useState(false)
    return (
      <View>
        <NButton onPress={() => setVisible(true)}>옵션 선택</NButton>
        <NBottomSheet {...args} visible={visible} onClose={() => setVisible(false)} title="옵션 선택">
          <View style={{ gap: 8 }}>
            <NButton variant="ghost" onPress={() => setVisible(false)}>사진 촬영</NButton>
            <NDivider />
            <NButton variant="ghost" onPress={() => setVisible(false)}>앨범에서 선택</NButton>
            <NDivider />
            <NButton variant="ghost" onPress={() => setVisible(false)}>파일 첨부</NButton>
            <NDivider />
            <NButton variant="danger" onPress={() => setVisible(false)}>취소</NButton>
          </View>
        </NBottomSheet>
      </View>
    )
  },
}
