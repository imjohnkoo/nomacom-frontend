import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { NAlert } from '@imjohnkoo/design-mobile'

const meta = {
  title: 'Feedback/NAlert',
  component: NAlert,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
    title: { control: 'text' },
    description: { control: 'text' },
    onClose: { action: 'closed' },
  },
  args: { title: '알림 메시지', color: 'info' },
} satisfies Meta<typeof NAlert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithDescription: Story = { args: { description: '자세한 설명이 여기에 표시됩니다.' } }
export const Closable: Story = { args: { onClose: () => {} } }

export const AllColors: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <NAlert color="info" title="정보" description="참고할 정보입니다." />
      <NAlert color="success" title="성공" description="작업이 완료되었습니다." />
      <NAlert color="warning" title="주의" description="확인이 필요합니다." />
      <NAlert color="error" title="오류" description="문제가 발생했습니다." />
    </View>
  ),
}
