import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { NCard, NText } from '@imjohnkoo/design-mobile'

const meta = {
  title: 'Layout/NCard',
  component: NCard,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['elevated', 'outlined', 'filled'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
  },
  args: { variant: 'elevated', padding: 'md' },
} satisfies Meta<typeof NCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <NCard {...args}>
      <NText variant="h3">카드 제목</NText>
      <NText style={{ marginTop: 8 }}>카드 본문 내용이 여기에 들어갑니다.</NText>
    </NCard>
  ),
}

export const AllVariants: Story = {
  render: (args) => (
    <View style={{ gap: 16 }}>
      <NCard {...args} variant="elevated">
        <NText variant="label">Elevated</NText>
        <NText variant="bodySmall">그림자가 있는 카드</NText>
      </NCard>
      <NCard {...args} variant="outlined">
        <NText variant="label">Outlined</NText>
        <NText variant="bodySmall">테두리가 있는 카드</NText>
      </NCard>
      <NCard {...args} variant="filled">
        <NText variant="label">Filled</NText>
        <NText variant="bodySmall">배경색이 있는 카드</NText>
      </NCard>
    </View>
  ),
}
