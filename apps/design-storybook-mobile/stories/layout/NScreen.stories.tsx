import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { NScreen, NText } from '@imjohnkoo/design-mobile'

const meta = {
  title: 'Layout/NScreen',
  component: NScreen,
  tags: ['autodocs'],
  argTypes: {
    scroll: { control: 'boolean' },
    padding: { control: 'boolean' },
    backgroundColor: { control: 'color' },
  },
  args: { scroll: true, padding: true },
} satisfies Meta<typeof NScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <NScreen {...args} style={{ height: 400, width: 340 }}>
      <NText variant="h2">스크린 콘텐츠</NText>
      <NText style={{ marginTop: 8 }}>스크롤 가능한 스크린 컨테이너입니다.</NText>
      {Array.from({ length: 20 }, (_, i) => (
        <NText key={i} style={{ marginTop: 12 }}>항목 {i + 1}</NText>
      ))}
    </NScreen>
  ),
}

export const NoPadding: Story = {
  args: { padding: false },
  render: (args) => (
    <NScreen {...args} style={{ height: 300, width: 340 }}>
      <NText variant="h3">패딩 없음</NText>
    </NScreen>
  ),
}
