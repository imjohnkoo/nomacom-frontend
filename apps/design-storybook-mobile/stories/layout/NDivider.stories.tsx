import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { NDivider, NText } from '@imjohnkoo/design-mobile'

const meta = {
  title: 'Layout/NDivider',
  component: NDivider,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    color: { control: 'color' },
    spacing: { control: 'number' },
  },
  args: {},
} satisfies Meta<typeof NDivider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithLabel: Story = { args: { label: 'OR' } }

export const InContext: Story = {
  render: () => (
    <View>
      <NText>첫 번째 섹션</NText>
      <NDivider />
      <NText>두 번째 섹션</NText>
      <NDivider label="또는" />
      <NText>세 번째 섹션</NText>
    </View>
  ),
}
